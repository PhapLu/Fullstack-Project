// ESM
import mongoose from 'mongoose';
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import DistributionHub from '../models/DistributionHub.model.js';
import User from '../models/User.model.js'; // nếu cần xác minh role shipper

// Yêu cầu: req.session.user = { _id, role }
export const requireAuth = (req, res, next) => {
  if (req?.session?.user?._id) return next();
  return res.status(401).json({ message: 'Unauthorized' });
};
export const requireRole = (role) => (req, res, next) => {
  if (req?.session?.user?.role === role) return next();
  return res.status(403).json({ message: 'Forbidden' });
};

async function pickRandomHub() {
  const [hub] = await DistributionHub.aggregate([{ $sample: { size: 1 } }]);
  if (!hub) throw new Error('No distribution hubs seeded');
  return hub;
}

/**
 * POST /api/orders
 * body: { items: [{ productId, quantity }], shippingAddress: string }
 * - Lấy giá + vendor từ DB
 * - Gom theo vendorId => tạo 1 order / vendor
 * - Gán distributionHubId ngẫu nhiên
 */
export const createOrders = async (req, res) => {
  try {
    const user = req.session.user;
    if (user.role !== 'customer') return res.status(403).json({ message: 'Only customers can create orders' });

    const itemsPayload = Array.isArray(req.body?.items) ? req.body.items : [];
    const shippingAddress = (req.body?.shippingAddress || '').trim();
    if (!itemsPayload.length) return res.status(400).json({ message: 'No items' });
    if (shippingAddress.length < 5) return res.status(400).json({ message: 'Invalid shippingAddress' });

    // Tải products để lấy giá & vendorId
    const ids = itemsPayload.map(i => new mongoose.Types.ObjectId(i.productId));
    const products = await Product.find({ _id: { $in: ids } })
      .select('_id price vendorId'); // đảm bảo Product có vendorId
    const map = new Map(products.map(p => [String(p._id), p]));

    // Gom theo vendorId
    const byVendor = new Map();
    for (const i of itemsPayload) {
      const p = map.get(String(i.productId));
      if (!p) return res.status(400).json({ message: `Product not found: ${i.productId}` });
      const qty = Math.max(1, Number(i.quantity || 1));
      const line = { productId: p._id, quantity: qty, priceAtPurchase: p.price };
      const key = String(p.vendorId);
      if (!byVendor.has(key)) byVendor.set(key, []);
      byVendor.get(key).push(line);
    }

    const hub = await pickRandomHub();
    const ordersToInsert = [];
    for (const [vendorId, lines] of byVendor.entries()) {
      ordersToInsert.push({
        customerId: user._id,
        vendorId,
        items: lines,
        distributionHubId: hub._id,
        shipperId: null,
        status: 'placed',
        shippingAddress,
        placedAt: new Date(),
      });
    }

    const created = await Order.insertMany(ordersToInsert);
    // Có thể xoá Cart tại đây nếu bạn lưu DB cho Cart

    // Trả về đã populate tối thiểu
    const populated = await Order.find({ _id: { $in: created.map(o => o._id) } })
      .populate('distributionHubId', 'name address')
      .populate('items.productId', 'name')
      .lean();

    res.status(201).json({ orders: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Failed to create orders' });
  }
};

/** GET /api/orders/my?status=placed|...  (customer) */
export const getMyOrders = async (req, res) => {
  try {
    const { _id, role } = req.session.user;
    if (role !== 'customer') return res.status(403).json({ message: 'Forbidden' });
    const q = { customerId: _id };
    if (req.query.status) q.status = req.query.status;
    const orders = await Order.find(q)
      .sort('-createdAt')
      .select('_id status createdAt vendorId distributionHubId')
      .populate('distributionHubId', 'name')
      .lean();
    res.json({ orders });
  } catch {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

/** GET /api/orders/:id (customer xem đơn của mình, shipper cùng hub xem) */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('distributionHubId', 'name address')
      .populate('items.productId', 'name price')
      .lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const { _id, role } = req.session.user;
    if (role === 'customer' && String(order.customerId) !== String(_id))
      return res.status(403).json({ message: 'Forbidden' });

    if (role === 'shipper') {
      // shipper chỉ xem đơn thuộc hub của mình
      const shipper = await User.findById(_id).select('assignedHub'); // tuỳ bạn lưu assignedHub ở đâu
      if (!shipper?.assignedHub || String(shipper.assignedHub) !== String(order.distributionHubId))
        return res.status(403).json({ message: 'Forbidden' });
    }
    res.json({ order });
  } catch {
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

/** GET /api/orders/shipper?status=placed|at_hub|out_for_delivery|delivered|cancelled */
export const getShipperOrders = async (req, res) => {
  try {
    const { _id } = req.session.user; // shipper userId
    // Lấy hub của shipper (tuỳ cấu trúc User/ ShipperProfile của bạn)
    const shipper = await User.findById(_id).select('assignedHub');
    if (!shipper?.assignedHub) return res.status(400).json({ message: 'Shipper not assigned to a hub' });

    const status = req.query.status || 'placed';
    const orders = await Order.find({ distributionHubId: shipper.assignedHub, status })
      .populate('items.productId', 'name')
      .lean();
    res.json({ orders });
  } catch {
    res.status(500).json({ message: 'Failed to fetch shipper orders' });
  }
};

/** PATCH /api/orders/:id/status  body: { status: 'out_for_delivery'|'delivered'|'cancelled' } */
export const updateOrderStatus = async (req, res) => {
  try {
    const { _id } = req.session.user; // shipper userId
    const shipper = await User.findById(_id).select('assignedHub');
    if (!shipper?.assignedHub) return res.status(400).json({ message: 'Shipper not assigned to a hub' });

    const next = req.body?.status;
    const ALLOWED = ['out_for_delivery', 'delivered', 'cancelled'];
    if (!ALLOWED.includes(next)) return res.status(400).json({ message: 'Invalid status' });

    // chỉ update đơn thuộc hub của shipper
    const setDoc = { status: next, shipperId: _id };
    if (next === 'delivered') setDoc.deliveredAt = new Date();

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, distributionHubId: shipper.assignedHub },
      { $set: setDoc },
      { new: true }
    ).lean();

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch {
    res.status(500).json({ message: 'Failed to update status' });
  }
};
