import mongoose from "mongoose";
const { Schema } = mongoose;

const DOCUMENT_NAME = "Cart";
const COLLECTION_NAME = "Carts";

const CartItemSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const CartSchema = new Schema(
    {
        customerId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
        items: { type: [CartItemSchema], default: [] },
    },
    { timestamps: true, collection: COLLECTION_NAME }
);

const Cart = mongoose.model(DOCUMENT_NAME, CartSchema);
export default Cart;
