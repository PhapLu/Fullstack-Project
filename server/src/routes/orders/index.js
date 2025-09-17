// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Gia Hy
// ID: S4053650

import { Router } from "express";
import orderController from "../../controllers/order.controller.js";
import { verifyToken } from "../../middlewares/jwt.middleware.js";

const router = Router();

router.use(verifyToken);

router.post("/createOrder", orderController.createOrder);
router.patch("/updateOrderStatus/:orderId", orderController.updateOrderStatus);
router.get("/readOrder/:orderId", orderController.readOrder);
router.get(
  "/readOrdersByHub/:distributionHubId",
  orderController.readOrdersByHub
);
router.get("/readOrders", orderController.readOrders);
router.post("/:orderId/assign-hub", orderController.assignOrderToHub);
router.post(
  "/createOrderAndGeneratePaymentUrl",
  orderController.createOrderAndGeneratePaymentUrl
);

export default router;
