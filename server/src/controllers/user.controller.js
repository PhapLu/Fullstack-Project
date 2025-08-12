import UserService from '../services/user.service.js'
import { SuccessResponse } from "../core/success.response.js"

class UserController {
    readData = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Read user data successfully',
            metadata: await UserService.readData(req)
        }).send(res)
    }
}

export default new UserController()