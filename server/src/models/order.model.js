import mongoose from "mongoose";
const { Schema } = mongoose;

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";

const OrderItemSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        priceAtPurchase: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const OrderSchema = new Schema(
    {
        customerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        items: {
            type: [OrderItemSchema],
            required: true,
            validate: { validator: v => Array.isArray(v) && v.length > 0, message: "Order must have at least one item" },
        },
        distributionHubId: { type: Schema.Types.ObjectId, ref: "DistributionHub", required: true, index: true },
        shipperId: { type: Schema.Types.ObjectId, ref: "User", index: true },
        status: {
            type: String,
            enum: ["placed", "at_hub", "out_for_delivery", "delivered", "cancelled"],
            default: "placed",
            index: true,
        },
        shippingAddress: { type: String, required: true, trim: true, minlength: 5 },
        placedAt: { type: Date, default: Date.now },
        deliveredAt: { type: Date },
    },
    { timestamps: true, collection: COLLECTION_NAME }
);

const Order = mongoose.model(DOCUMENT_NAME, OrderSchema);
export default Order;
