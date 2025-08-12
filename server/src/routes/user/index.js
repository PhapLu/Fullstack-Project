import express from "express"
import userController from "../../controllers/user.controller.js"
import { asyncHandler } from "../../auth/checkAuth.js"
import { verifyToken } from "../../middlewares/jwt.middelware.js"

const router = express.Router()

router.get('/readUserProfile/:profileDomainName', asyncHandler(userController.readUserProfile))
router.get('/me', asyncHandler(userController.me))
router.get('/readData', asyncHandler(userController.readData))

//authentication
router.use(verifyToken)

export default router