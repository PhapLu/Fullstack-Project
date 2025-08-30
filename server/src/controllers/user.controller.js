import UserService from '../services/user.service.js'
import { SuccessResponse } from "../core/success.response.js"

class UserController {
    readUserProfile = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Read user profile successfully',
            metadata: await UserService.readUserProfile(req)
        }).send(res)
    }

    me = async (req, res, next) => {
        console.log(req.cookies)
        console.log(req.cookies.accessToken)
        return new SuccessResponse({
            message: 'User information retrieved successfully',
            metadata: await UserService.me(req.cookies.accessToken)
        }).send(res)
    }

    updateUserProfile = async (req, res, next) => {
        return new SuccessResponse({
            message: 'User profile updated successfully',
            metadata: await UserService.updateUserProfile(req)
        }).send(res)
    }

    updateProfilePicture = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Profile picture updated successfully',
            metadata: await UserService.updateProfilePicture(req)
        }).send(res)
    }

    readBrands = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Read brands successfully',
            metadata: await UserService.readBrands()
        }).send(res)
    }
}

export default new UserController()