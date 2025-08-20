import { Router } from "express";
import orderController from "../../controllers/order.controller.js";
import { verifyToken } from "../../middlewares/jwt.middleware.js";

const router = Router();

router.use(verifyToken);

// tạo đơn (nếu dùng)
router.post("/createOrders", orderController.createOrder);
router.get("/readOrders", orderController.readOrder);
router.get("/readOrder/:orderId", orderController.readOrder);
router.get(
  "/readOrdersByHub/:distributionHubId",
  orderController.readOrdersByHub
);
router.post("/:orderId/assign-hub", orderController.assignOrderToHub);
router.patch("updateOrderStatus/:orderId", orderController.updateOrderStatus);

export default router;
