import bcrypt from "bcrypt"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import role from "../middlewares/role.middleware.js"
import ForgotPasswordOTP from "../models/forgotPasswordOTP.model.js"
import UserOTPVerification from "../models/userOTPVerification.model.js"
import User from "../models/user.model.js"
import { AuthFailureError, BadRequestError } from "../core/error.response.js"
import { sendOtpEmail } from "../configs/brevo.config.js"
import { isValidPassword, isAllowedEmail } from "../models/repositories/auth.repo.js" 
import Conversation from "../models/conversation.model.js"

class AuthService {
    //-------------------CRUD----------------------------------------------------
    static login = async ({ email, password }) => {
        // 1. Check user
        const user = await User.findOne({ email });
        if (!user) throw new BadRequestError("User not found");
        
        // 2. Login validation
        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new AuthFailureError("Account or password is invalid");
    
        let token = jwt.sign(
            {
                id: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET
        );
        user.accessToken = token;
        await user.save();

        // 3. Check unseen conversations
        const userId = user._id;
          
        const [filteredUnSeenConversations] = await Promise.all([
            // Conversations with at least 1 message
            Conversation.find({
                members: { $elemMatch: { user: userId } },
                "messages.0": { $exists: true },
            })
                .select("members messages")
                .populate("members.user", "avatar fullName domainName")
                .populate("messages.senderId", "avatar fullName domainName")
                .lean()
                .then((conversations) =>
                    conversations.filter((conv) => {
                        const last = conv.messages[conv.messages.length - 1];
                        return (
                            last &&
                            !last.isSeen &&
                            last.senderId &&
                            last.senderId._id.toString() !== userId.toString()
                        );
                    })
                ),
        ]);
        const userData = user.toObject();
    
        userData.unSeenConversations = filteredUnSeenConversations;
    
        return {
            code: 200,
            metadata: {
                user: { ...userData },
            },
        };
    };    

    static signUp = async ({
        // common
        username,
        email,
        password,
        role,               // "customer" | "vendor" | "shipper"
        avatar,             // file path 
        fullName,           // optional for your platform
      
        // customer
        name,
        address,
      
        // vendor
        businessName,
        businessAddress,
      
        // shipper
        assignedHubId       // DistributionHub _id (string)
    }) => {
        // ---- 1) base validations ----
        if (!isValidUsername(username)) throw new BadRequestError("Invalid username: 8-15 letters/digits only.");
        if (!isValidPasswordPerBrief(password)) throw new BadRequestError("Invalid password policy.");
        if (!["customer", "vendor", "shipper"].includes(role)) throw new BadRequestError("Invalid role.");
        if (!avatar) throw new BadRequestError("Profile picture (avatar) is required.");
      
        // Optional: restrict allowed emails
        // if (!isAllowedEmail(email)) throw new BadRequestError("Invalid Email");
      
        // ---- 2) uniqueness: username (system-wide) ----
        const usernameTaken = await User.findOne({ username }).select("_id").lean();
        if (usernameTaken) throw new BadRequestError("Username already exists");
      
        // You may also wish to ensure no pending OTP uses the same username:
        const pendingWithSameUsername = await UserOTPVerification.findOne({ username }).select("_id").lean();
        if (pendingWithSameUsername) throw new BadRequestError("Username is reserved in a pending registration. Try again later.");
      
        // ---- 3) role-specific checks ----
        let customerProfile, vendorProfile, shipperProfile;
      
        if (role === "customer") {
          if (!minLen5(name))    throw new BadRequestError("Name must be at least 5 characters.");
          if (!minLen5(address)) throw new BadRequestError("Address must be at least 5 characters.");
          customerProfile = { name: name.trim(), address: address.trim() };
        }
      
        if (role === "vendor") {
          if (!minLen5(businessName))    throw new BadRequestError("Business name must be at least 5 characters.");
            if (!minLen5(businessAddress)) throw new BadRequestError("Business address must be at least 5 characters.");
        
            // Soft pre-checks (DB partial unique indexes will enforce hard constraints)
            const dupBiz = await User.findOne({ role: "vendor", "vendorProfile.businessName": businessName }).select("_id").lean();
            if (dupBiz) throw new BadRequestError("Business name already in use by another vendor.");
            const dupAddr = await User.findOne({ role: "vendor", "vendorProfile.businessAddress": businessAddress }).select("_id").lean();
            if (dupAddr) throw new BadRequestError("Business address already in use by another vendor.");
        
            vendorProfile = { businessName: businessName.trim(), businessAddress: businessAddress.trim() };
        }
      
        if (role === "shipper") {
            if (!assignedHubId) throw new BadRequestError("Assigned hub is required.");
            const hub = await DistributionHub.findById(assignedHubId).select("_id").lean();
            if (!hub) throw new BadRequestError("Invalid assigned hub.");
            shipperProfile = { assignedHub: hub._id };
        }
      
        // ---- 4) hash password ----
        const passwordHash = await bcrypt.hash(password, 10);
      
        // ---- 5) Upsert/insert OTP record (with daily caps if you want) ----
        const otp = crypto.randomInt(100000, 999999).toString();
        const now = new Date();
      
        // You can enforce your daily requestCount policy here; minimal example:
        const existingOtp = await UserOTPVerification.findOne({ email }).lean();
        if (existingOtp && existingOtp.lastRequestDate) {
            const last = new Date(existingOtp.lastRequestDate);
            const sameDay = last.toDateString() === now.toDateString();
            if (sameDay && existingOtp.requestCount >= 10) {
                throw new BadRequestError("You have exceeded the maximum number of OTP requests for today.");
            }
        }
      
        await UserOTPVerification.findOneAndUpdate(
            { email },
            {
                $set: {
                email,
                fullName: fullName || "",
                username,
                role,
                avatar,
                passwordHash,
                customerProfile,
                vendorProfile,
                shipperProfile,
                otp,
                lastRequestDate: now,
                isVerified: false
                },
                $inc: { requestCount: 1 }
            },
            { upsert: true, new: true }
        );
      
        // ---- 6) send OTP ----
        try {
            await sendOtpEmail(
                email,
                "[Pastal] OTP for Account Registration",
                "Your verification code to complete account registration is:",
                otp
            );
        } catch (err) {
            console.error("Error sending OTP:", err);
            throw new BadRequestError("Failed to send verification email");
        }
      
        return {
            code: 201,
            metadata: { email }
        };
    };

    static verifyOtp = async ({ email, otp }) => {
        // 1. Find the OTP in the database
        const otpRecord = await UserOTPVerification.findOne({ email }).lean()

        // 2. Check if the OTP is correct
        if (!otpRecord || otpRecord.otp !== otp) {
            throw new BadRequestError("Invalid OTP code")
        }

        // 3. Check if the OTP is expired
        if (otpRecord.expiredAt < new Date()) {
            throw new BadRequestError("OTP code has expired")
        }

        // 4. Create user by otpVerification
        // 4.1 Create user
        const newUser = await User.create({
            fullName: otpRecord.fullName,
            email: otpRecord.email,
            password: otpRecord.password,
            role: otpRecord.role, // Use the string directly
        })
        await newUser.save()

        //7. Delete the OTP record
        await UserOTPVerification.deleteOne({ email })

        //8. Create token
        let token = jwt.sign(
            {
                id: newUser._id,
                email: newUser.email,
            },
            process.env.JWT_SECRET
        )

        newUser.accessToken = token
        await newUser.save()

        const { password: hiddenPassword, ...userWithoutPassword } =
            newUser.toObject() // Ensure toObject() is used to strip the password
        return {
            code: 200,
            metadata: {
                user: userWithoutPassword,
            },
        }
    }

    static forgotPassword = async ({ email }) => {
        // 1. Find the user by email
        const user = await User.findOne({ email }).select('email').lean()
        if (!user) throw new BadRequestError("Account has not been registered")

        const oldOtp = await ForgotPasswordOTP.findOne({ email }).lean()
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Set to the start of the day

        let otp
        if (oldOtp) {
            const lastRequestDate = new Date(oldOtp.lastRequestDate)
            lastRequestDate.setHours(0, 0, 0, 0) // Set to the start of the day

            if (lastRequestDate.getTime() === today.getTime()) {
                // Same day request
                if (oldOtp.requestCount >= 10) {
                    throw new BadRequestError("You have exceeded the maximum number of requests for today. Please try again tomorrow.")
                } else {
                    // Increment request count and generate new OTP
                    otp = crypto.randomInt(100000, 999999).toString()
                    await ForgotPasswordOTP.updateOne(
                        { email },
                        {
                            $inc: { requestCount: 1 },
                            $set: {
                                otp,
                                expiredAt: new Date(
                                    Date.now() + 30 * 60 * 1000
                                ),
                                lastRequestDate: new Date(),
                            },
                        }
                    )
                }
            } else {
                // Different day request, reset count and generate new OTP
                otp = crypto.randomInt(100000, 999999).toString()
                await ForgotPasswordOTP.updateOne(
                    { email },
                    {
                        $set: {
                            requestCount: 1,
                            lastRequestDate: new Date(),
                            otp,
                            expiredAt: new Date(Date.now() + 30 * 60 * 1000),
                        },
                    }
                )
            }
        } else {
            // New OTP request
            otp = crypto.randomInt(100000, 999999).toString()
            const forgotPasswordOTP = new ForgotPasswordOTP({
                email,
                otp,
                expiredAt: new Date(Date.now() + 30 * 60 * 1000), // OTP expires in 30 minutes
                requestCount: 1,
                lastRequestDate: new Date(),
            })
            await forgotPasswordOTP.save()
        }

        // 3. Send OTP email
        try {
            const subject = `[Pastal] OTP for Password Change`;
            const message = `Your verification code to change your password is:`;
            const verificationCode = otp;

            await sendOtpEmail(email, subject, message, verificationCode);
        } catch (error) {
            console.error(error);
            throw new BadRequestError("Failed to send verification email");
        }

        return {
            code: 200,
            metadata: {
                email,
            },
        }
    }

    static verifyResetPasswordOtp = async ({ email, otp }) => {
        //1. Find, check the OTP and user in the database
        const otpRecord = await ForgotPasswordOTP.findOne({ email })

        // 2. Check if the OTP is correct
        if (!otpRecord || otpRecord.otp !== otp) {
            throw new BadRequestError("Invalid OTP code")
        }
        if (otpRecord.expiredAt < new Date())
            throw new BadRequestError("OTP code has expired")

        //3. Mark the otp is verified
        otpRecord.isVerified = true
        otpRecord.save()

        return {
            message: "OTP verified successfully",
        }
    }

    static resetPassword = async ({ email, password }) => {
        //1. Find and check the OTP and user in the database
        const otpRecord = await ForgotPasswordOTP.findOne({ email })
        const user = await User.findOne({ email }).select('email password')

        // 2. Check if the OTP is correct
        if (!otpRecord)
            throw new BadRequestError("Invalid OTP code")

        if (otpRecord.expiredAt < new Date())
            throw new BadRequestError("OTP code has expired")

        if (!user) throw new BadRequestError("Account has not been registered")

        //2. Check if the OTP is verified
        if (!otpRecord.isVerified)
            throw new BadRequestError("OTP has not been verified")

        //3. Hash the new password
        if (!isValidPassword(password)) throw new BadRequestError('Invalid password')
        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword

        await user.save()

        //4. Delete the OTP record
        await ForgotPasswordOTP.deleteOne({ email })

        return {
            message: "Password reset successfully",
        }
    }

    static grantAccess(action, resource) {
        return async (req, res, next) => {
            try {
                const userInfo = await User.findById(req.userId).select('role').lean()
                const userRole = userInfo.role
                const permission = role.can(userRole)[action](resource)
                if (!permission.granted) {
                    return res.status(401).json({
                        error: "You are not authorized to perform this action",
                    })
                }
                next()
            } catch (error) {
                next(error)
            }
        }
    }
}

export default AuthService;
