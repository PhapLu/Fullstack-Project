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
import DistributionHub from "../models/distributionHub.model.js"

class AuthService {
    //-------------------CRUD----------------------------------------------------
    static login = async ({ username, password }) => {
        // 1. Check user
        const user = await User.findOne({ username });
        if (!user) throw new BadRequestError("User not found");
        
        // 2. Login validation
        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new AuthFailureError("Account or password is invalid");
    
        let token = jwt.sign(
            {
                id: user._id,
                username: user.username,
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
                token
            },
        };
    };    

    static signUp = async ({
        // common
        username,
        email,
        password,
        role,             
        assignedHubId,
        businessName,
        businessAddress,    
    }) => {
        // 1. Validate inputs
        if (!username) throw new BadRequestError("Invalid username: 8-15 letters/digits only.");
        if (!password) throw new BadRequestError("Invalid password policy.");

        if (typeof password !== "string") {
            throw new BadRequestError("Password is required.");
        }
        if (password.length < 8) {
            throw new BadRequestError("Password must be at least 8 characters.");
        }
        if (password.length > 20) {
            throw new BadRequestError("Password must be at most 20 characters.");
        }
        if (!/[A-Z]/.test(password)) {
            throw new BadRequestError("Password must include at least one uppercase letter.");
        }
        if (!/[a-z]/.test(password)) {
            throw new BadRequestError("Password must include at least one lowercase letter.");
        }
        if (!/\d/.test(password)) {
            throw new BadRequestError("Password must include at least one digit.");
        }
        if (!/[!@#$%^&*]/.test(password)) {
            throw new BadRequestError("Password must include at least one special character (!@#$%^&*).");
        }
        if (!/^[A-Za-z0-9!@#$%^&*]+$/.test(password)) {
            throw new BadRequestError("Password contains invalid characters (allowed: letters, digits, !@#$%^&*).");
        }

        if (!["customer", "vendor", "shipper"].includes(role)) throw new BadRequestError("Invalid role.");
        let customerProfile, vendorProfile, shipperProfile;
        if (role === "customer") {
            customerProfile = { };
        }
        if (role === "vendor") {
            if (!businessName) {
                throw new BadRequestError("Business name is required.");
            }
            if (businessName.length < 5) {
                throw new BadRequestError("Business name must be at least 5 characters.");
            }
            if (!businessAddress) {
                throw new BadRequestError("Business address is required.");
            }
            if (businessAddress.length < 5) {
                throw new BadRequestError("Business address must be at least 5 characters.");
            }
            vendorProfile = { businessName: businessName.trim(), businessAddress: businessAddress.trim() };
        }
      
        if (role === "shipper") {
            if(!assignedHubId) throw new BadRequestError("Missing assigned hub for shipper.");
            shipperProfile = { assignedHub: assignedHubId };
        }

        // 4) hash password
        const passwordHash = await bcrypt.hash(password, 10);
      
        // 5) Upsert/insert OTP record (with daily caps if you want)
        const otp = crypto.randomInt(100000, 999999).toString();
        const now = new Date();
        try {
            await UserOTPVerification.findOneAndUpdate(
                { email },
                {
                    $set: {
                        email,
                        username,
                        role,
                        password: passwordHash,
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
        } catch (error) {
            console.log(error)
        }
      
        // 6) send OTP
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
        // 4.1 Build base fields
        const userData = {
            username: otpRecord.username,
            email: otpRecord.email,
            password: otpRecord.password, // match schema!
            role: otpRecord.role,
        };

        // Add role-specific profile
        if (otpRecord.role === "customer" && otpRecord.customerProfile) {
            userData.customerProfile = otpRecord.customerProfile;
        }
        if (otpRecord.role === "vendor" && otpRecord.vendorProfile) {
            userData.vendorProfile = {
                businessName: otpRecord.vendorProfile.businessName,
                businessAddress: otpRecord.vendorProfile.businessAddress,
            };
        }
        if (otpRecord.role === "shipper") {
            const assignedHub = otpRecord.shipperProfile?.assignedHub;
            if (!assignedHub) throw new BadRequestError("Missing assigned hub for shipper.");
            userData.shipperProfile = { assignedHub };
        }

        const newUser = new User(userData);
        await newUser.save();
        
        //7. Delete the OTP record
        await UserOTPVerification.deleteOne({ email });

        const token = jwt.sign({ id: newUser._id, email: newUser.email }, process.env.JWT_SECRET);
        return {
            code: 200,
            metadata: {
                user: newUser.toObject({ versionKey: false, transform: (_, ret) => { delete ret.password; return ret } }),
                token,
            },
        };
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
