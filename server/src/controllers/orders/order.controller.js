import * as svc from "../../services/orders/order.service.js";

// Alias cho FE hiện tại
export async function getMyOrders(req, res) {
  const userId = req.user?.id || "u1";
  const status = req.query.status;
  const orders = await svc.getOrdersByCustomer(userId, status);
  res.json({ orders });
}

export async function getOrdersByCustomer(req, res) {
  const { customerId } = req.params;
  const { status } = req.query;
  const orders = await svc.getOrdersByCustomer(customerId, status);
  res.json({ orders });
}

export async function getOrdersByVendor(req, res) {
  const { vendorId } = req.params;
  const { status } = req.query;
  const orders = await svc.getOrdersByVendor(vendorId, status);
  res.json({ orders });
}

export async function getOrdersByHub(req, res) {
  const { hubId } = req.params;
  const { status } = req.query;
  const orders = await svc.getOrdersByHub(hubId, status);
  res.json({ orders });
}

export async function assignOrderToHub(req, res) {
  const { orderId } = req.params;
  const { hubId } = req.body;
  const order = await svc.assignOrderToHub(orderId, hubId);
  res.json({ order });
}

export async function updateOrderStatus(req, res) {
  const { orderId } = req.params;
  const { shipperId, status } = req.body;
  const order = await svc.updateOrderStatus(orderId, shipperId, status);
  res.json({ order });
}

export async function getOrderById(req, res) {
  const { id } = req.params;
  const order = await svc.getOrderById(id);
  res.json({ order });
}

export async function createOrders(req, res) {
  const { items = [], shippingAddress = {} } = req.body || {};
  const customerId = req.user?.id || "u1";
  const orders = await svc.createOrders(items, shippingAddress, customerId);
  res.status(201).json({ orders });
}
