import mongoose from "mongoose";
import Order from "../models/order.model.js";

class VendorDashboardService {
  static async readVendorOrders(req) {
    const vendorId = req.user._id;

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

  static async readVendorOrderDetail(req) {
    const vendorId = new mongoose.Types.ObjectId(req.user._id || req.userId);
    const orderId = new mongoose.Types.ObjectId(req.params.orderId);

    const pipeline = [
      { $match: { _id: orderId } },
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
    ];

    const docs = await Order.aggregate(pipeline);
    if (!docs.length) {
      throw new Error("Unauthorized to view this order or order not found");
    }

    const order = await Order.findById(orderId)
      .populate({
        path: "items.product",
        select: "name vendorId",
        populate: { path: "vendorId", select: "name" },
      })
      .populate("distributionHubId", "name address")
      .populate("deliveryInformationId");

    if (!order) throw new NotFoundError("Order not found");

    const filtered = order.filterItemsByVendor(vendorId);
    return { filtered };
  }
}

export default VendorDashboardService;
