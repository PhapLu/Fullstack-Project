// route/adminDashboard/index.js
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
  "/updateHub/:id",
  asyncHandler(AdminDashboardController.updateHub)
);

router.delete(
  "/deleteHub/:id",
  asyncHandler(AdminDashboardController.deleteHub)
);

export default router;
