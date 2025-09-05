import mongoose from "mongoose";
import Order from "../models/order.model.js";

class VendorDashboardService {
    static async readVendorOrders(req) {
        const vendorId = new mongoose.Types.ObjectId(req.userId);

        const orders = await Order.aggregate([
            { $unwind: "$items" },

            // Lookup product for each item
            {
                $lookup: {
                    from: "Products", // <- exact name from Product schema
                    let: { pid: "$items.productId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$pid"] } } },
                        { $project: { _id: 1, title: 1, vendorId: 1 } },
                    ],
                    as: "product",
                },
            },
            { $unwind: "$product" },

            // Keep only items that belong to this vendor
            { $match: { "product.vendorId": vendorId } },

            // Rebuild items array (only the vendor's items)
            {
                $group: {
                    _id: "$_id",
                    customerId: { $first: "$customerId" },
                    distributionHubId: { $first: "$distributionHubId" },
                    deliveryInformationId: { $first: "$deliveryInformationId" },
                    status: { $first: "$status" },
                    paymentType: { $first: "$paymentType" },
                    placedAt: { $first: "$placedAt" },
                    deliveredAt: { $first: "$deliveredAt" },
                    pricing: { $first: "$pricing" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },

                    items: {
                        $push: {
                            productId: "$product", // embed {_id, title, vendorId} for FE
                            quantity: "$items.quantity",
                            priceAtPurchase: "$items.priceAtPurchase",
                        },
                    },
                },
            },

            { $match: { "items.0": { $exists: true } } },

            // DeliveryInformation
            {
                $lookup: {
                    from: "DeliveryInformations", // <- exact name from DeliveryInformation schema
                    localField: "deliveryInformationId",
                    foreignField: "_id",
                    as: "deliveryInformation",
                },
            },
            {
                $unwind: {
                    path: "$deliveryInformation",
                    preserveNullAndEmptyArrays: true,
                },
            },

            // DistributionHub (if you want to show hub name/address)
            {
                $lookup: {
                    from: "DistributionHubs", // <- ensure this matches your schema's collection name
                    localField: "distributionHubId",
                    foreignField: "_id",
                    as: "distributionHub",
                },
            },
            {
                $unwind: {
                    path: "$distributionHub",
                    preserveNullAndEmptyArrays: true,
                },
            },

            // Customer
            {
                $lookup: {
                    from: "Users",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customer",
                },
            },
            {
                $unwind: {
                    path: "$customer",
                    preserveNullAndEmptyArrays: true,
                },
            },

            // Final shape (note: we expose deliveryInformationId/distributionHubId as the looked-up docs)
            {
                $project: {
                    _id: 1,
                    items: 1,
                    pricing: 1,
                    status: 1,
                    paymentType: 1,
                    placedAt: 1,
                    deliveredAt: 1,
                    createdAt: 1,
                    updatedAt: 1,

                    // expose populated docs under same field names the FE reads
                    deliveryInformationId: {
                        _id: "$deliveryInformation._id",
                        name: "$deliveryInformation.name",
                        phoneNumber: "$deliveryInformation.phoneNumber",
                        address: "$deliveryInformation.address",
                        distributionHubId:
                            "$deliveryInformation.distributionHubId",
                    },

                    distributionHubId: {
                        _id: "$distributionHub._id",
                        name: "$distributionHub.name",
                        address: "$distributionHub.address",
                    },

                    customerId: 1, // keep raw id if you still need it
                    customer: {
                        _id: "$customer._id",
                        // prefer customerProfile.name; fallback to username or email
                        name: {
                            $ifNull: [
                                "$customer.customerProfile.name",
                                {
                                    $ifNull: [
                                        "$customer.username",
                                        "$customer.email",
                                    ],
                                },
                            ],
                        },
                    },
                },
            },

            { $sort: { createdAt: -1 } },
        ]);

        return { orders };
    }
}

export default VendorDashboardService;
