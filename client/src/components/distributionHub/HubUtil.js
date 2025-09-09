export const STATUS_FLOW = ["placed", "paid", "cancelled", "delivered"];

export const labelOf = (s) =>
  s === "placed"
    ? "Placed"
    : s === "paid"
    ? "Paid"
    : s === "delivered"
    ? "Delivered"
    : s === "cancelled"
    ? "Cancelled"
    : "Unknown";
