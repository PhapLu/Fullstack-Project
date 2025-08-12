import mongoose from "mongoose";
const { Schema } = mongoose;

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

const ProductSchema = new Schema(
    {
        vendorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        title: { type: String, required: true, trim: true, minlength: 5 },
        description: { type: String, required: true, trim: true, minlength: 5 },
        price: { type: Number, required: true, min: 0 },
        stock: { type: Number, required: true, min: 0 },
        images: [{ type: String }],
        status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    },
    { timestamps: true, collection: COLLECTION_NAME }
);

const Product = mongoose.model(DOCUMENT_NAME, ProductSchema);
export default Product;