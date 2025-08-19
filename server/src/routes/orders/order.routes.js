import { Router } from 'express';
import {
  getOrdersByCustomer,
  getOrdersByVendor,
  getOrdersByHub,
  assignOrderToHub,
  updateOrderStatus,
  getMyOrders,
  getOrderById,      // phải tồn tại trong controller
  createOrders       // hoặc createOrder: SỬA TÊN CHO KHỚP EXPORT THẬT
} from '../../controllers/orders/order.controller.js';

const router = Router();

// alias FE: GET /api/orders/me
router.get('/me', getMyOrders);

// tạo đơn (nếu dùng)
router.post('/', createOrders);

// tra cứu theo thực thể
router.get('/customer/:customerId', getOrdersByCustomer);
router.get('/vendor/:vendorId', getOrdersByVendor);
router.get('/hub/:hubId', getOrdersByHub);

// thao tác đơn
router.post('/:orderId/assign-hub', assignOrderToHub);
router.patch('/:orderId/status', updateOrderStatus);

router.get('/:id', getOrderById);

export default router;
