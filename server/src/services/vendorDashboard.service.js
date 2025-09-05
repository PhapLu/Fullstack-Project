import mongoose from "mongoose";
import Order from "../models/order.model.js";

class VendorDashboardService {
  static async readVendorOrders(req) {
    const vendorId = req.userId;

    const pipeline = [
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $match: { "product.vendorId": vendorId } },
      {
        $group: {
          _id: "$_id",
          customerId: { $first: "$customerId" },
          distributionHubId: { $first: "$distributionHubId" },
          status: { $first: "$status" },
          placedAt: { $first: "$placedAt" },
          deliveredAt: { $first: "$deliveredAt" },
          pricing: { $first: "$pricing" },
          deliveryInformationId: { $first: "$deliveryInformationId" },
          items: {
            $push: {
              productId: "$items.productId",
              quantity: "$items.quantity",
              priceAtPurchase: "$items.priceAtPurchase",
            },
          },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const orders = await Order.find()
      .populate({
        path: "items.product",
        select: "name vendorId",
        populate: { path: "vendorId", select: "name" },
      })
      .populate("distributionHubId", "name address")
      .populate("deliveryInformationId")
      .lean();

    const vendorOrders = orders.filter((o) =>
      o.items.some(
        (it) => it.product?.vendorId?._id?.toString() === vendorId.toString()
      )
    );

    return { orders };
  }
}

export default VendorDashboardService;
