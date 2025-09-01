import UserService from '../services/user.service.js'
import { SuccessResponse } from "../core/success.response.js"

class UserController {
    readUserProfile = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Read user profile successfully',
            metadata: await UserService.readUserProfile(req)
        }).send(res)
    }

    uploadAvatar = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Avatar uploaded successfully',
            metadata: await UserService.uploadAvatar(req)
        }).send(res)
    }

    me = async (req, res, next) => {
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

    readBrands = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Read brands successfully',
            metadata: await UserService.readBrands()
        }).send(res)
    }
}

export default new UserController()