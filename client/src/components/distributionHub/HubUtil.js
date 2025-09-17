// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Tran Bao Tran
// ID: S3975175

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
