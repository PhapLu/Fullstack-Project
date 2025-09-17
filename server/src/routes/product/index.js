// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Gia Hy
// ID: S4053650

import express from "express";
import productController from "../../controllers/product.controller.js";
import { asyncHandler } from "../../auth/checkAuth.js";
import { verifyToken } from "../../middlewares/jwt.middleware.js";
import { uploadDisk, useUploadDir } from "../../configs/multer.config.js";

const router = express.Router();

router.get("/readProducts", asyncHandler(productController.readProducts));
router.get(
  "/readProfileProducts/:vendorId",
  asyncHandler(productController.readProfileProducts)
);
router.get("/searchProducts", asyncHandler(productController.searchProducts));
router.get(
  "/readProduct/:productId",
  asyncHandler(productController.readProduct)
);

//Authentication
router.use(verifyToken);
router.post(
  "/createProduct",
  useUploadDir("products"),
  uploadDisk.array("files", 10),
  asyncHandler(productController.createProduct)
);
router.patch("/updateProduct", asyncHandler(productController.updateProduct));
router.delete(
  "/deleteProduct/:productId",
  asyncHandler(productController.deleteProduct)
);

export default router;
