import mongoose from "mongoose";
const { Schema } = mongoose;

const DOCUMENT_NAME = "Review";
const COLLECTION_NAME = "Reviews";

const ReviewSchema = new Schema(
    {
        orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
        customerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true, trim: true, minlength: 5 },

        productId: { type: Schema.Types.ObjectId, ref: 'Product', require: true, index: true },
        images: {
            type: [String],
            validate: {
                validator: (arr) => !arr || arr.length <= 5,
                message: 'images must have at most 5 items'
            }
        },
        isPublished: { type: Boolean, default: true },
    },
    { timestamps: true, collection: COLLECTION_NAME }
);

ReviewSchema.index({ productId: 1, createAt: -1 });

ReviewSchema.index(
    { orderId: 1, productId: 1, customerId: 1 },
    { unique: true, name: 'uniq_order_product_customer' }
);

ReviewSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next){
    const blocked = ['orderId', 'productId', 'customerId'];
    const update = this.getUpdate() || {};
    const tries = Object.keys(update);
    const hasBlocked = 
        tries.some(k => blocked.includes(k)) ||
        (update.$set && Object.keys(update.$set).some(k => blocked.includes(k)));

        if (hasBlocked) return next(new Error('orderId/productId/customerId are immutable'));
        next();
});

const Review = mongoose.model(DOCUMENT_NAME, ReviewSchema);
export default Review;