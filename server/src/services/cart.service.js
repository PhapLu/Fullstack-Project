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
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

class CartService {
  //-------------------CRUD----------------------------------------------------
  static addToCart = async (req) => {
    const customerId = req.userId;
    let { productId, quantity } = req.body;

    // 1) Validate
    if (!productId) throw new BadRequestError("Product ID is required");
    quantity = Math.max(1, Number(quantity) || 1);

    // 2) Check customer & product & cart
    const customer = await User.findById(customerId);
    if (!customer) throw new AuthFailureError("You are not authenticated!");

    const product = await Product.findById(productId).select(
      "stock price title thumbnail"
    );
    if (!product) throw new NotFoundError("Product not found");
    const cart = await Cart.findOne({ customerId });
    if (!cart) {
      // Create cart for customer
      await Cart.create({
        customerId,
        items: [],
      });
    }

    // 3) Read existing qty once to enforce stock cap
    const existing = await Cart.findOne(
      { customerId, "items.productId": productId },
      { "items.$": 1 }
    ).lean();

    const prevQty = existing?.items?.[0]?.quantity || 0;
    const stock = Number.isFinite(product.stock) ? product.stock : Infinity;
    const nextQty = Math.min(prevQty + quantity, stock);
    const delta = nextQty - prevQty;

    if (delta <= 0) {
      // nothing to change (already at stock cap)
      const cart = await this.readCart(req);
      return { message: "No change (stock limit reached)", cart };
    }

    let updatedCart;

    // 4) Increment if exists, else push
    if (prevQty > 0) {
      updatedCart = await Cart.updateOne(
        { customerId, "items.productId": productId },
        {
          $inc: { "items.$.quantity": delta, version: 1 },
          $set: { updatedAt: new Date() },
        }
      );
    } else {
      updatedCart = await Cart.updateOne(
        { customerId },
        {
          $push: { items: { productId, quantity: delta } },
          $setOnInsert: { customerId },
          $inc: { version: 1 },
          $set: { updatedAt: new Date() },
        },
        { upsert: true }
      );
    }

    return { cart: updatedCart };
  };

  static readCart = async (req) => {
    const customerId = req.userId;

    // 1. Check customer
    const customer = await User.findById(customerId);
    if (!customer) throw new AuthFailureError("You are not authenticated!");

    // 2. Get cart items
    let cart = await Cart.findOne({ customerId })
      .populate("items.productId", "title price images")
      .lean();
    console.log("CART", cart);
    if (!cart) {
      // Create cart for customer
      cart = await Cart.create({
        customerId,
      });
      cart.save();
    }

    // 3. Return cart items
    return {
      cart,
    };
  };

  static snapshot = async (req) => {
    const customerId = req.userId;
    const { items = [] } = req.body;

    const customer = await User.findById(customerId);
    if (!customer) throw new AuthFailureError("You are not authenticated!");

    const normalized = items
      .filter((x) => x?.productId && Number(x.quantity) > 0)
      .map((x) => ({
        productId: x.productId,
        quantity: Number(x.quantity),
      }));

    await Cart.updateOne(
      { customerId },
      {
        $set: { items: normalized, updatedAt: new Date() },
        $inc: { version: 1 },
      },
      { upsert: true }
    );

    const cart = await Cart.findOne({ customerId })
      .populate(
        "items.productId",
        "title price images thumbnail stock classification"
      )
      .lean();

    return { cart };
  };
}

export default CartService;
