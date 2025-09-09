import {
  AuthFailureError,
  BadRequestError,
  NotFoundError,
} from "../core/error.response.js";
import DistributionHub from "../models/distributionHub.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

class AdminDashboardService {
  static readOverview = async (req) => {
    // -------- timeframe --------
    const period = String(req?.query?.period || "month").toLowerCase();
    const now = new Date();
    const start = new Date(now);
    if (period === "year") {
      start.setUTCFullYear(start.getUTCFullYear() - 1);
    } else {
      // month (approx; fine for rolling overview)
      start.setUTCMonth(start.getUTCMonth() - 1);
    }

    // -------- Users (by role) --------
    const roleBuckets = await User.aggregate([
      {
        $group: {
          _id: { $toLower: { $ifNull: ["$role", "unknown"] } },
          count: { $sum: 1 },
        },
      },
    ]);

    const roleCount = (role) =>
      roleBuckets.find((b) => b._id === role)?.count || 0;

    const users = {
      total: roleBuckets.reduce((s, b) => s + (b.count || 0), 0),
      vendors: roleCount("vendor"),
      customers: roleCount("customer"),
      shippers: roleCount("shipper"),
    };

    // -------- Products total --------
    const productsTotal = await Product.countDocuments({});
    const products = { total: productsTotal };

    // -------- Orders by status (active/delivered) --------
    const ACTIVE_STATUSES = ["placed", "paid", "at_hub", "out_for_delivery"];

    const [activeOrders, deliveredOrders] = await Promise.all([
      Order.countDocuments({ status: { $in: ACTIVE_STATUSES } }),
      Order.countDocuments({ status: "delivered" }),
    ]);

    const ordersByStatus = [
      { _id: "active", count: activeOrders },
      { _id: "delivered", count: deliveredOrders },
    ];

    // -------- Revenue by day within [start, now] (delivered only) --------
    // Uses pricing.total; falls back to 0 if missing
    const revenue7d = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          placedAt: { $gte: start, $lte: now },
        },
      },
      {
        $addFields: {
          _rev: { $ifNull: ["$pricing.total", 0] },
          _date: {
            $dateToString: {
              date: "$placedAt",
              format: "%Y-%m-%d",
              timezone: "UTC",
            },
          },
        },
      },
      {
        $group: {
          _id: "$_date",
          revenue: { $sum: "$_rev" },
          orders: { $sum: 1 },
        },
      },
      { $project: { _id: 1, revenue: { $round: ["$revenue", 2] }, orders: 1 } },
      { $sort: { _id: 1 } },
    ]);

    // -------- Top vendors by product count (also sum catalog value) --------
    // Assumes Product has vendorId and price fields.
    const topVendors = await Product.aggregate([
      {
        $group: {
          _id: "$vendorId",
          items: { $sum: 1 }, // number of products listed
          revenue: { $sum: { $ifNull: ["$price", 0] } }, // catalog value, keeps UI happy
        },
      },
      { $sort: { items: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "Users",
          localField: "_id",
          foreignField: "_id",
          as: "vendor",
        },
      },
      {
        $addFields: {
          vendorName: {
            $let: {
              vars: { v: { $arrayElemAt: ["$vendor", 0] } },
              in: {
                $ifNull: [
                  "$$v.vendorProfile.businessName",
                  {
                    $ifNull: [
                      "$$v.username",
                      { $ifNull: ["$$v.email", "Unknown Vendor"] },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          vendorId: "$_id",
          vendorName: 1,
          items: 1,
          revenue: { $round: ["$revenue", 2] },
        },
      },
    ]);

    // -------- assemble payload for UI --------
    return {
      adminDashboard: {
        users,
        products,
        ordersByStatus,
        revenue7d,
        topVendors,
      },
    };
  };

  static readHubs = async (req) => {
    //1. Check admin
    const admin = await User.findById(req.userId);
    if (!admin)
      throw new BadRequestError(
        "You are not authorized to perform this action"
      );

    //2. Find and read Hubs
    const hubs = await DistributionHub.find();
    return {
      hubs,
    };
  };

  static updateHub = async (req) => {
    const hubId = req.params.distributionHubId;

    //1. Check admin
    const admin = await User.findById(req.userId);
    if (!admin)
      throw new BadRequestError(
        "You are not authorized to perform this action"
      );

    //2. Find hub by id 
    const hub = await DistributionHub.findByIdAndUpdate(hubId);

    // 3. Update fields from req.body
    const updates = req.body; 
    Object.assign(hub, updates);

    // 4. Save updated hub
    await hub.save();
    
    return {
      hub,
    };
  };

  static deleteHub = async (req) => {
    const hubId = req.params.distributionHubId;
    //1. Check admin
    const admin = await User.findById(req.userId);
    if (!admin)
      throw new BadRequestError(
        "You are not authorized to perform this action"
      );

    //2. Find hub by id
    const hub = await DistributionHub.findByIdAndDelete(hubId);

    return {
      hub,
    };
  };
}

export default AdminDashboardService;
