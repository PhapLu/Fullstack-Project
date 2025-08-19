import express from "express";
import CartController from "../../controllers/cart.controller.js";
import { asyncHandler } from "../../auth/checkAuth.js";
import { verifyToken } from "../../middlewares/jwt.middleware.js";
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router();

router.use(verifyToken)

router.post("/readCart/:cartId", asyncHandler(CartController.readCart));
router.post("/addToCart", asyncHandler(CartController.addToCart));
router.post("/removeFromCart", asyncHandler(CartController.removeFromCart));

export default router;
