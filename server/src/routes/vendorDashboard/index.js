import { Router } from "express";
import vendorDashboardController from "../../controllers/vendorDashboard.controller.js";
import { verifyToken } from "../../middlewares/jwt.middleware.js";

const router = Router();

router.use(verifyToken);
// router.use(checkRole("vendor"));

router.get("/readVendorOrders", vendorDashboardController.readVendorOrders);

export default router;
