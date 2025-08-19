import { Router } from "express";
import {
  getOrdersByCustomer,
  getOrdersByVendor,
  getOrdersByHub,
  assignOrderToHub,
  updateOrderStatus,
  getMyOrders, // alias cho FE hiện tại
} from "../../controllers/orders/order.controller.js";

const router = Router();

// ALIAS cho FE đang gọi /api/orders/me
router.get("/me", getMyOrders);

// 1) getOrdersByCustomer(customerId)
router.get("/customer/:customerId", getOrdersByCustomer);

// 2) getOrdersByVendor(vendorId)
router.get("/vendor/:vendorId", getOrdersByVendor);

// 3) getOrdersByHub(hubId)
router.get("/hub/:hubId", getOrdersByHub);

// 4) assignOrderToHub(orderId, hubId)
router.post("/:orderId/assign-hub", assignOrderToHub);

// 5) updateOrderStatus(orderId, shipperId, status)
router.patch("/:orderId/status", updateOrderStatus);

router.get("/:id", getOrderById);
router.post("/", createOrders);
router.get("/me", getMyOrders);

export default router;
