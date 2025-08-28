import { AuthFailureError, BadRequestError, NotFoundError } from "../core/error.response.js"
import User from "../models/user.model.js"
import path from "path";
import fs from "fs/promises";

const UPLOADS_DIR = path.join(process.cwd(), "src", "uploads");

class UserService {
    //-------------------CRUD----------------------------------------------------
    static readUserProfile = async(req) => {
        const userProfileId = req.params.userId

        // 1. Check user profile
        const userProfile = await User.findById(userProfileId)
        if (!userProfile) throw new AuthFailureError('User profile not found')

        // 2. Return user profile data
        return{
            user: userProfile,
        }
    }

    static updateUserProfile = async(req) => {
        const userId = req.userId
        const { fullName, email, phoneNumber, address } = req.body

        // 1. Validate inputs
        if (!fullName || !email || !phoneNumber || !address) {
            throw new AuthFailureError('All fields are required')
        }

        // 2. Check user
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('User not found')
        // 3. Update user profile
        user.fullName = fullName;
        user.email = email;
        user.phoneNumber = phoneNumber;
        user.address = address;

        await user.save();

        // 4. Return updated user profile
        return {
            message: 'User profile updated successfully',
        }
    }

    static updateProfilePicture = async (req) => {
        const userId = req.userId;
        const image = req.file;
        if (!image) throw new BadRequestError("Profile picture is required");
        
        // 1. Check user
        const user = await User.findById(userId);
        if (!user) throw new NotFoundError("User not found");
      
        // 2. Build the public URL and return to the client
        const filename = path.basename(image.path);
        const publicUrl = `/uploads/${filename}`;
      
        // 3. Delete old file
        if (user.profilePicture && !/^https?:\/\//i.test(user.profilePicture)) {
            const oldBase = path.basename(user.profilePicture);
            const oldFileAbs = path.join(UPLOADS_DIR, oldBase);
            try {
                await fs.unlink(oldFileAbs);
            } catch (err) {
                if (err.code !== "ENOENT") console.warn("Failed to delete old avatar:", err);
            }
        }
        
        // 4. Update user profile with new picture
        user.profilePicture = publicUrl;
        await user.save();
      
        return { profilePicture: publicUrl };
    };

    static readBrands = async(req) => {
        // 1. Read brands - which are vendors started selling more than 1 year ago
        const brands = await User.find({
            role: 'vendor',
            createdAt: { $lte: new Date(Date.now() - 365*24*60*60*1000) }
        })

        return {
            users: brands,
        }
    }
}

export default UserService;
