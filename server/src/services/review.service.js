// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Gia Hy
// ID: S4053650

import {
  AuthFailureError,
  BadRequestError,
  NotFoundError,
} from "../core/error.response.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";

class ReviewService {
  //-------------------CRUD----------------------------------------------------
  static createReview = async (req) => {
    const userId = req.userId;
    const body = req.body;

    // 1. Check user, order, product
    const user = await User.findById(userId);
    if (!user) throw new AuthFailureError("You are not authenticated!");

    const order = await Order.findById(body.orderId);
    if (!order) throw new NotFoundError("Order not found");

    const product = await Product.findById(body.productId);
    if (!product) throw new NotFoundError("Product not found");

    if (userId !== order.customerId.toString())
      throw new BadRequestError("You can not review for this product");

    // 2. Validate body
    if (!body.rating || body.rating < 1 || body.rating > 5)
      throw new BadRequestError("Rating must be between 1 and 5");
    if (!body.comment || body.comment.length < 5)
      throw new BadRequestError("Comment must be at least 5 characters");
    const existingReview = await Review.findOne({
      customerId: userId,
      orderId: body.orderId,
      productId: body.productId,
    });
    if (existingReview)
      throw new BadRequestError("You have already reviewed this product");
    if (order.status !== "delivered")
      throw new BadRequestError(
        "You can only review products from delivered orders"
      );
    const orderItem = order.items.find(
      (item) => item.productId.toString() === body.productId
    );
    if (!orderItem)
      throw new BadRequestError(
        "This product is not in your order, you can not review it"
      );

    // 3. Create review
    const review = await Review.create({
      customerId: userId,
      orderId: body.orderId,
      productId: body.productId,
      rating: body.rating,
      comment: body.comment,
    });
    await review.save();

    // 4. Update order
    order.isReviewed = true;
    await order.save();

    return {
      review,
    };
  };

  static readReviews = async (req) => {
    const productId = req.params.productId;

    // 1. Check product exists
    const product = await Product.findById(productId);
    if (!product) throw new NotFoundError("Product not found");

    // 2. Get all reviews for this product
    const reviews = await Review.find({ productId })
      .populate("customerId", "customerProfile avatar email")
      .populate("productId", "status createdAt");
    return {
      reviews,
    };
  };
}

export default ReviewService;
