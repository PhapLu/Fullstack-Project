import { Router } from "express";
import orderController from "../../controllers/order.controller.js";
import { verifyToken } from "../../middlewares/jwt.middleware.js";

const router = Router();

router.use(verifyToken);

// tạo đơn (nếu dùng)
router.post("/createOrder", orderController.createOrder);
router.get("/readOrder/:orderId", orderController.readOrder);
router.get("/readOrdersByHub/:distributionHubId", orderController.readOrdersByHub);
router.post("/:orderId/assign-hub", orderController.assignOrderToHub);

export default router;
