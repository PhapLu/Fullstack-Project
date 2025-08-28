import express from "express"
import userController from "../../controllers/user.controller.js"
import { asyncHandler } from "../../auth/checkAuth.js"
import { verifyToken } from "../../middlewares/jwt.middleware.js"
import { uploadDisk } from "../../configs/multer.config.js"

const router = express.Router()

router.get('/readUserProfile/:userId', asyncHandler(userController.readUserProfile))
router.get('/readBrands', asyncHandler(userController.readBrands))
router.get('/me', asyncHandler(userController.me))

//Authentication
router.use(verifyToken)

router.patch('/updateUserProfile', asyncHandler(userController.updateUserProfile))
router.patch('/updateProfilePicture', uploadDisk.single('file'), asyncHandler(userController.updateProfilePicture))

export default router