import {
    AuthFailureError,
    BadRequestError,
    NotFoundError,
} from "../core/error.response.js";
import DistributionHub from "../models/distributionHub.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import dotenv from "dotenv";
import AlepayService from "./alepay.service.js";
dotenv.config();

class OrderService {
    //-------------------CRUD----------------------------------------------------
    static createOrder = async (req) => {
        const userId = req.userId;
        const body = req.body;
        // 1. Check user
        const user = await User.findById(userId);
        if (!user) throw new AuthFailureError("You are not authenticated!");
        console.log("BODY", body);
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

    static updateOrderStatus = async (req) => {
        const orderId = req.params.orderId;
        const userId = req.userId;
        const { status } = req.body;
        // 1. Check shipper, order
        const shipper = await User.findById(userId);
        if (!shipper) throw new AuthFailureError("You are not authorized to perform this action");
        const order = await Order.findById(orderId)
            .populate("items.productId")
            .populate("deliveryInformationId")
            .populate("distributionHubId", "name address")
            .populate("customerId", "customerProfile avatar")
        if (!order) throw new NotFoundError("Order not found");

        // 2. Validate body
        if (status !== "delivered" && status !== "cancelled")
            throw new BadRequestError("Invalid status");

        // 3. Update order status
        order.status = status;
        order.save();

        return {
            order,
        };
    };

    static readOrders = async (req) => {
        const userId = req.userId;

        // 1. Check user
        const user = await User.findById(userId);
        if (!user) throw new AuthFailureError("You are not authenticated!");

        // 2. Read orders
        const orders = await Order.find({ customerId: userId })
            .populate("distributionHubId", "name address")
            .populate("items.productId")
            .populate("deliveryInformationId")
            .sort({ createdAt: -1 })
            .lean()
        
        return {
            orders,
        };
    };

    static createOrderAndGeneratePaymentUrl = async (req) => {
        const userId = req.userId;
        const body = req.body;

        // 1: Check user
        const user = await User.findById(userId);
        if (!user)
            throw new NotFoundError(
                "Bạn cần đăng nhập để thực hiện thao tác này"
            );

        // 2. Validate body and create order
        if (!body.items || body.items.length === 0)
            throw new BadRequestError("Order must have at least one item");
        if (!body.distributionHubId)
            throw new BadRequestError("Distribution Hub is required");
        if (!body.deliveryInformation || !body.deliveryInformation._id)
            throw new BadRequestError("Delivery Information is required");
        if (!body.pricing || !body.pricing.total)
            throw new BadRequestError("Pricing information is required");

        const order = await Order.create({
            customerId: userId,
            items: body.items,
            distributionHubId: body.distributionHubId,
            deliveryInformationId: body.deliveryInformation._id,
            paymentType: body.payment || "cash",
            placedAt: Date.now(),
            status: "paid",
            pricing: body.pricing,
        });

        // 3. Prepare payment data for AlePay
        const amount = order.pricing.total;
        console.log(amount.toString());

        try {
            const paymentDetails = {
                tokenKey: process.env.ALEPAY_TOKEN_KEY,
                orderCode: order._id.toString(), // Unique order code
                customMerchantId: userId,
                amount: 100000,
                orderDescription: `Order ${order._id} payment`,
                totalItem: 1,
                returnUrl: process.env.ALEPAY_RETURN_URL,
                cancelUrl: process.env.ALEPAY_CANCEL_URL,
                buyerName: user.customerProfile.name || 'User',
                buyerEmail: user.email,
                buyerPhone: user.phone || "0988888888",
                buyerAddress: "Ho Chi Minh",
                buyerCity: "Ho Chi Minh",
                buyerCountry: "Vietnam",
            };
            const paymentData = await AlepayService.generatePaymentData(
                paymentDetails
            );

            // Send payment data to Alepay API
            const alepayBaseUrl =
                process.env.NODE_ENV === "production"
                    ? process.env.ALEPAY_BASE_URL
                    : process.env.ALEPAY_LOCAL_BASE_URL;
            const response = await fetch(`${alepayBaseUrl}/request-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paymentData),
            });

            // Validate response
            if (!response.ok) {
                const errorBody = await response.text();
                console.error("AlePay API Error Response:", errorBody);
                throw new Error(`AlePay API Error: ${response.statusText}`);
            }

            const paymentResponse = await response.json();
            console.log("Payment Response:", paymentResponse);

            // Return only the payment URL to the frontend
            return {
                paymentUrl: paymentResponse.checkoutUrl,
            };
        } catch (error) {
            console.error("Error generating payment URL:", error.message);
            throw new BadRequestError("Error generating payment URL");
        }
    };

    static readOrder = async (req) => {
        const userId = req.userId;
        const orderId = req.params.orderId;

        // 1. Check user, order
        const user = await User.findById(userId);
        if (!user) throw new AuthFailureError("You are not authenticated!");
        const order = await Order.findById(orderId)
            .populate("deliveryInformationId")
            .populate("items.productId", "title images price");
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
        const orders = await Order.find({
            distributionHubId: hubId,
            status: { $in: ["placed", "paid"] },
        })
            .populate("customerId", "customerProfile avatar")
            .populate("distributionHubId", "name address")
            .populate("items.productId")
            .populate("deliveryInformationId");

        return {
            orders,
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
}

export default OrderService;
