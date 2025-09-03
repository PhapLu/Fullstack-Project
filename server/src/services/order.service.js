import {
    AuthFailureError,
    BadRequestError,
    NotFoundError,
} from "../core/error.response.js";
import DistributionHub from "../models/distributionHub.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";

// In-memory stub; thay bằng DB sau
let ORDERS = [
    {
        _id: "o1",
        customerId: "u1",
        vendorId: "v1",
        hubId: null,
        shipperId: null,
        status: "placed",
        items: [],
    },
    {
        _id: "o2",
        customerId: "u2",
        vendorId: "v1",
        hubId: "h1",
        shipperId: "s1",
        status: "assigned",
        items: [],
    },
];

const validStatus = new Set([
    "placed",
    "assigned",
    "shipping",
    "delivered",
    "cancelled",
]);

export async function getOrdersByCustomer(customerId, status) {
    return ORDERS.filter(
        (o) => o.customerId === customerId && (!status || o.status === status)
    );
}
export async function getOrdersByVendor(vendorId, status) {
    return ORDERS.filter(
        (o) => o.vendorId === vendorId && (!status || o.status === status)
    );
}
export async function getOrdersByHub(hubId, status) {
    return ORDERS.filter(
        (o) => o.hubId === hubId && (!status || o.status === status)
    );
}
export async function assignOrderToHub(orderId, hubId) {
    const o = ORDERS.find((x) => x._id === orderId);
    if (!o) throw new Error("Order not found");
    o.hubId = hubId;
    if (o.status === "placed") o.status = "assigned";
    return o;
}
export async function updateOrderStatus(orderId, shipperId, status) {
    if (!validStatus.has(status)) throw new Error("Invalid status");
    const o = ORDERS.find((x) => x._id === orderId);
    if (!o) throw new Error("Order not found");
    if (shipperId) o.shipperId = shipperId;
    o.status = status;
    return o;
}
export async function getOrderById(id) {
    const o = ORDERS.find((x) => x._id === id);
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
        shippingAddress,
    };
    ORDERS.push(newOrder);
    return [newOrder]; // FE đang mong array
}

class OrderService {
    //-------------------CRUD----------------------------------------------------
    static createOrder = async (req) => {
        const userId = req.userId;
        const body = req.body;
        // 1. Check user
        const user = await User.findById(userId);
        if (!user) throw new AuthFailureError("You are not authenticated!");

        // 2. Validate inputs
        if (!body.items || body.items.length === 0)
            throw new BadRequestError("Order must have at least one item");
        if (!body.distributionHubId)
            throw new BadRequestError("Distribution Hub is required");

        // 3. Create order
        const order = await Order.create({
            customerId: userId,
            items: body.items,
            distributionHubId: body.distributionHubId,
            deliveryInformationId: body.deliveryInformation._id,
            paymentType: body.payment || "cash",
            placedAt: Date.now(),
            status: "placed",
            pricing: body.pricing,
        });
        await order.save();
        return {
            message: "Order created successfully",
            order,
        };
    };

    static readOrder = async (req) => {
        const userId = req.userId;
        const orderId = req.params.orderId;

        // 1. Check user, order
        const user = await User.findById(userId);
        if (!user) throw new AuthFailureError("You are not authenticated!");
        const order = await Order.findById(orderId);
        if (!order) throw new NotFoundError("Order not found");

        // 2. Return order
        return {
            order,
        };
    };

    static readOrdersByHub = async (req) => {
        const userId = req.userId;
        const hubId = req.params.distributionHubId;

        // 1. Check user, order
        const user = await User.findById(userId);
        if (!user) throw new AuthFailureError("You are not authenticated!");
        const hub = await DistributionHub.findById(hubId);
        if (!hub) throw new NotFoundError("Distribution Hub not found");

		//2. Read orders
		const orders = await Order.find({ distributionHubId: hubId })
			.populate('customerId', 'customerProfile avatar')
			.populate('distributionHubId', 'name address')
			.populate('items.productId')
            .populate('deliveryInformationId')
        console.log(orders);

        // 2. Return order
        return {
            orders
        };
    };

    static assignOrderToHub = async (req) => {
        const userId = req.userId;
        const orderId = req.params.orderId;
        const hubId = req.params.hubId;

        // 1. Check user, order
        const user = await User.findById(userId);
        if (!user) throw new AuthFailureError("You are not authenticated!");

        const hubOrder = await Order.findById(hubId);
        if (!hubOrder) throw new NotFoundError("Order to Hub not found");

        const order = await Order.findById(orderId);
        if (!order) throw new NotFoundError("Order not found");

        if (
            hubOrder.customerId.toString() !== userId &&
            hubOrder.vendorId.toString() !== userId
        )
            throw new AuthFailureError(
                "You are not authorized to perform this action"
            );

        const hub = await Hub.findById(hubId);
        if (!hub || hub.status === "inactive") {
            throw new NotFoundError("Hub not found or inactive");
        }

        // 2. Update
        const updated = await Order.findOneAndUpdate(
            { _id: orderId }, // optionally add preconditions like { status: order.status }
            {
                hubId,
                hubAssignedAt: now,
                hubAssignedBy: userId,
            },
            { new: true, runValidators: true }
        );

        // 2. Return order
        return {
            order: updated,
        };
    };

    static updateOrderStatus = async (req) => {
    };
}

export default OrderService;
