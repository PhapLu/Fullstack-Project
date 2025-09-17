// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Luu Quoc Phap
// ID: S4024611

import express from "express";
import DeliveryInformationController from "../../controllers/deliveryInformation.controller.js";
import { asyncHandler } from "../../auth/checkAuth.js";
import { verifyToken } from "../../middlewares/jwt.middleware.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.use(verifyToken);

router.get(
  "/readDeliveryInformations",
  asyncHandler(DeliveryInformationController.readDeliveryInformations)
);

router.get(
  "/readDeliveryInformation/:deliveryInformationId",
  asyncHandler(DeliveryInformationController.readDeliveryInformation)
);
router.post(
  "/createDeliveryInformation",
  asyncHandler(DeliveryInformationController.createDeliveryInformation)
);

router.delete(
  "/deleteDeliveryInformation/:deliveryInformationId",
  asyncHandler(DeliveryInformationController.deleteDeliveryInformation)
);

export default router;
