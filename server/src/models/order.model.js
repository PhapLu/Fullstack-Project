// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Gia Hy
// ID: S4053650

import mongoose from "mongoose";
const { Schema } = mongoose;

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";

const OrderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Order must have at least one item",
      },
    },
    distributionHubId: {
      type: Schema.Types.ObjectId,
      ref: "DistributionHub",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["placed", "paid", "delivered", "cancelled"],
      default: "placed",
      index: true,
    },
    paymentType: {
      type: String,
      enum: ["cash", "credit_card"],
      default: "cash",
    },
    deliveryInformationId: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryInformation",
      required: true,
    },
    placedAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date },
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      shippingFee: { type: Number, required: true, min: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    isReviewed: { type: Boolean, default: false },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

const Order = mongoose.model(DOCUMENT_NAME, OrderSchema);
export default Order;
