export const STATUS_FLOW = [
  "active",
  "at_hub",
  "out_for_delivery",
  "delivered",
];

export const labelOf = (s) =>
  s === "active"
    ? "Active"
    : s === "paid"
    ? "Paid"
    : s === "at_hub"
    ? "At hub"
    : s === "out_for_delivery"
    ? "Out for delivery"
    : s === "delivered"
    ? "Delivered"
    : s === "placed"
    ? "Placed"
    : "Unknown";
