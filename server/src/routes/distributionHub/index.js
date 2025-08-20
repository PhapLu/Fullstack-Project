import express from "express";
import DistributionHubController from "../../controllers/distributionHub.controller.js";
import { asyncHandler } from "../../auth/checkAuth.js";
import { verifyToken } from "../../middlewares/jwt.middleware.js";
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router();

router.post("/readDistributionHubs", asyncHandler(DistributionHubController.readDistributionHubs));

router.use(verifyToken)

router.post("/readDistributionHub/:distributionHubId", asyncHandler(DistributionHubController.readDistributionHub));
router.post("/createDistributionHub", asyncHandler(DistributionHubController.createDistributionHub));
router.post("/updateDistributionHub/:distributionHubId", asyncHandler(DistributionHubController.updateDistributionHub));
router.post("/deleteDistributionHub/:distributionHubId", asyncHandler(DistributionHubController.deleteDistributionHub));

export default router;
