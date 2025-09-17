// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Gia Hy
// ID: S4053650

import express from "express";
import CartController from "../../controllers/cart.controller.js";
import { asyncHandler } from "../../auth/checkAuth.js";
import { verifyToken } from "../../middlewares/jwt.middleware.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.use(verifyToken);

router.get("/readCart", asyncHandler(CartController.readCart));
router.post("/addToCart", asyncHandler(CartController.addToCart));
router.post("/removeFromCart", asyncHandler(CartController.removeFromCart));
router.put("/snapshot", asyncHandler(CartController.snapshot));
router.put("/applyPurchase", asyncHandler(CartController.applyPurchase));

export default router;
