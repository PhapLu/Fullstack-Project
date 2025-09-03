import express from "express";
import authRoute from "./auth/index.js";
import userRoute from "./user/index.js";
import orderRoute from "./orders/index.js";
import distributionHubRoute from "./distributionHub/index.js";
import cartRoute from "./cart/index.js";
import conversationRoute from "./conversation/index.js";
import productRoute from "./product/index.js";
import reviewRoute from "./review/index.js";
import deliveryInformationRoute from "./deliveryInformation/index.js";

const router = express.Router();

//Check Permission
router.use("/v1/api/auth", authRoute);
router.use("/v1/api/user", userRoute);
router.use("/v1/api/order", orderRoute);
router.use("/v1/api/cart", cartRoute);
router.use("/v1/api/review", reviewRoute);
router.use("/v1/api/product", productRoute);
router.use("/v1/api/conversation", conversationRoute);
router.use("/v1/api/distributionHub", distributionHubRoute);
router.use("/v1/api/deliveryInformation", deliveryInformationRoute);

export default router;
