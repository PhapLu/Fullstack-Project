import mongoose from "mongoose";
import Order from "../models/order.model.js";

const ALLOW_ORDER_STATUSES = ['delivered'];

function extractItems(order) {
    if (Array.isArray(order?.items) && order.items.length) return order.items;
    if (Array.isArray(order?.orderItems) && order.orderItems.length) return order.orderItems;
    return [];
}

function extractProductIdFromItem(it) {
    return it.productID || it.product?._id || it.product || it.product_id || null;
}

export async function verifyPurchased({ orderId, customerId, productId }) {
    if (![orderId, customerId, productId].every(mongoose.isValidObjectId)) {
        return {ok: false, reason: 'invalid_ids'};
    }

    const order = await Order.findOne({
        _id: orderId,
        $or: [{ customerId }, { userId: customerId }]
    }).lean();

    if (!order) return {ok: false, reason: 'order_not_found_or_not_owner'};

    if (!ALLOWED_ORDER_STATUSES.includes(order.status)) {
        return {ok: false, reason:'order_not_delivered'};
    }

    const items = extractItems(order);
    const hasProduct = items.some(it => {
        const pid = extractProductIdFromItem(it);
        return pid && pid.toString() === productId.toString();
    });

    if (!hasProduct) return { ok: false, reason: 'product_not_in_order' };

    return { ok: true };
}