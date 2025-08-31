import dotenv from 'dotenv'
dotenv.config();

import User from "../models/user.model.js"
import { AuthFailureError, BadRequestError, NotFoundError } from "../core/error.response.js"
import jwt from 'jsonwebtoken';
import fs from "fs/promises";
import path from "path";
import { UPLOADS_DIR } from '../configs/multer.config.js';

const AVATARS_DIR = path.join(UPLOADS_DIR, "avatars");
const publicUrlFor = (filename) => `/uploads/avatars/${filename}`;

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

    static me = async (accessToken) => {
        // 1. Decode accessToken
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        if (!decoded?.id) throw new AuthFailureError("Invalid token");

        const userId = decoded.id;

        // 2. Fetch user profile
        const user = await User.findById(userId)
            .select("-password -accessToken")
            .populate('shipperProfile.assignedHub', 'name address') // populate assignedHub with name and address only

            .lean(); // Use lean for faster read

        if (!user) throw new NotFoundError("User not found");

        return {
            user
        };
    };

    static uploadAvatar = async (req) => {
        const userId = req.userId;
        const file = req.file;
        if (!file) throw new BadRequestError("Avatar image is required");
        
        // 1. Check user
        const user = await User.findById(userId);
        if (!user) throw new NotFoundError("User not found");
        
        // 2. Process the uploaded file
        const filename = file.filename || path.basename(file.path);
        const url = publicUrlFor(filename);
        
        // 3. Delete old avatar if exists and is not an external URL
        if (user.avatar && !/^https?:\/\//i.test(user.avatar)) {
            try {
                const oldBase = path.basename(user.avatar);
                await fs.unlink(path.join(AVATARS_DIR, oldBase));
            } catch (err) {
                if (err.code !== "ENOENT") console.warn("delete old avatar failed:", err);
            }
        }
      
        user.avatar = url;
        await user.save();
        return { avatar: url, metadata: { avatar: url } };
    };

    static updateUserProfile = async(req) => {
        const userId = req.userId

        console.log('BODY', req.body)
        // 1. Validate inputs

        // 2. Check user
        const user = await User.findById(userId)
        if (!user) throw new AuthFailureError('User not found')

        // 3. Update user profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                ...req.body
            },
            { new: true }
        )
        console.log(updatedUser)

        // 4. Return updated user profile
        return {
            user: updatedUser,
        }
    }

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
