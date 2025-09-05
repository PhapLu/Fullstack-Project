import express from "express";
import AdminDashboardController from "../../controllers/adminDashboard.controller.js";
import { asyncHandler } from "../../auth/checkAuth.js";
import { verifyToken } from "../../middlewares/jwt.middleware.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();


router.use(verifyToken);

router.get(
  "/readOverview",
  asyncHandler(AdminDashboardController.readOverview)
);

router.get(
  "/readHubs",
  asyncHandler(AdminDashboardController.readHubs)
);



export default router;
