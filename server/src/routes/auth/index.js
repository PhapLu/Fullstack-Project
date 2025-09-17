// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Luu Quoc Phap
// ID: S4024611

import express from "express";
import authController from "../../controllers/auth.controller.js";
import { asyncHandler } from "../../auth/checkAuth.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

//signUp
router.post("/signUp", asyncHandler(authController.signUp));
router.post("/login", asyncHandler(authController.login));
router.post("/verifyOtp", asyncHandler(authController.verifyOtp));
router.post("/logout", asyncHandler(authController.logout));
router.post("/forgotPassword", asyncHandler(authController.forgotPassword));
router.post(
  "/verifyResetPasswordOtp",
  asyncHandler(authController.verifyResetPasswordOtp)
);
router.patch("/resetPassword", asyncHandler(authController.resetPassword));

export default router;
