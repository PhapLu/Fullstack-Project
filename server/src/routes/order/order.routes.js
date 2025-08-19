import { Router } from 'express';
import {
  requireAuth, requireRole,
  createOrders, getMyOrders, getOrderById,
  getShipperOrders, updateOrderStatus
} from '../../controllers/order.controller.js';

const router = Router();

// customer
router.post('/', requireAuth, createOrders);
router.get('/my', requireAuth, getMyOrders);
router.get('/:id', requireAuth, getOrderById);

// shipper
router.get('/shipper', requireAuth, requireRole('shipper'), getShipperOrders);
router.patch('/:id/status', requireAuth, requireRole('shipper'), updateOrderStatus);

export default router;
