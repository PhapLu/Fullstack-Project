// In-memory stub; thay bằng DB sau
let ORDERS = [
  { _id: "o1", customerId: "u1", vendorId: "v1", hubId: null, shipperId: null, status: "placed", items: [] },
  { _id: "o2", customerId: "u2", vendorId: "v1", hubId: "h1", shipperId: "s1", status: "assigned", items: [] },
];

const validStatus = new Set(["placed","assigned","shipping","delivered","cancelled"]);

export async function getOrdersByCustomer(customerId, status) {
  return ORDERS.filter(o => o.customerId === customerId && (!status || o.status === status));
}
export async function getOrdersByVendor(vendorId, status) {
  return ORDERS.filter(o => o.vendorId === vendorId && (!status || o.status === status));
}
export async function getOrdersByHub(hubId, status) {
  return ORDERS.filter(o => o.hubId === hubId && (!status || o.status === status));
}
export async function assignOrderToHub(orderId, hubId) {
  const o = ORDERS.find(x => x._id === orderId);
  if (!o) throw new Error("Order not found");
  o.hubId = hubId;
  if (o.status === "placed") o.status = "assigned";
  return o;
}
export async function updateOrderStatus(orderId, shipperId, status) {
  if (!validStatus.has(status)) throw new Error("Invalid status");
  const o = ORDERS.find(x => x._id === orderId);
  if (!o) throw new Error("Order not found");
  if (shipperId) o.shipperId = shipperId;
  o.status = status;
  return o;
}
export async function getOrderById(id) {
  const o = ORDERS.find(x => x._id === id);
  if (!o) throw new Error("Order not found");
  return o;
}
export async function createOrders(items, shippingAddress, customerId) {
  const newOrder = {
    _id: "o" + (ORDERS.length + 1),
    customerId,
    vendorId: "v1",
    hubId: null,
    shipperId: null,
    status: "placed",
    items,
    shippingAddress
  };
  ORDERS.push(newOrder);
  return [newOrder]; // FE đang mong array
}
