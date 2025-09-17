// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Luu Quoc Phap
// ID: S4024611

import express from "express";
import AdminDashboardController from "../../controllers/adminDashboard.controller.js";
import { asyncHandler } from "../../auth/checkAuth.js";
import { verifyToken } from "../../middlewares/jwt.middleware.js";

const router = express.Router();
router.use(verifyToken);

router.get(
  "/readOverview",
  asyncHandler(AdminDashboardController.readOverview)
);

router.get("/readHubs", asyncHandler(AdminDashboardController.readHubs));

router.patch(
  "/updateHub/:distributionHubId",
  asyncHandler(AdminDashboardController.updateHub)
);

router.delete(
  "/deleteHub/:distributionHubId",
  asyncHandler(AdminDashboardController.deleteHub)
);

export default router;
