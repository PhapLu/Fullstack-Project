import express from "express"
import productController from "../../controllers/product.controller.js"
import { asyncHandler } from "../../auth/checkAuth.js"
import { verifyToken } from "../../middlewares/jwt.middleware.js"
import { uploadDisk } from "../../configs/multer.config.js"

const router = express.Router()

//Authentication
router.use(verifyToken)
router.post('/createProduct', asyncHandler(productController.createProduct))
router.get('/readProduct', asyncHandler(productController.readProduct))
router.get('/readProducts', asyncHandler(productController.readProducts))
router.patch('/updateProduct', asyncHandler(productController.updateProduct))
router.delete('/deleteProduct', asyncHandler(productController.deleteProduct))

export default router