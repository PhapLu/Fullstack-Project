import { AuthFailureError, BadRequestError, NotFoundError } from "../core/error.response.js"
import Cart from "../models/cart.model.js"
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
      
        // 2) Check customer & product
        const customer = await User.findById(customerId);
        if (!customer) throw new AuthFailureError("You are not authenticated!");
      
        const product = await Product.findById(productId).select("stock price title thumbnail");
        if (!product) throw new NotFoundError("Product not found");
      
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
            const cart = await this.readCart(customerId);
            return { message: "No change (stock limit reached)", cart };
        }
      
        // 4) Increment if exists, else push
        if (prevQty > 0) {
          await Cart.updateOne(
            { customerId, "items.productId": productId },
            {
              $inc: { "items.$.quantity": delta, version: 1 },
              $set: { updatedAt: new Date() },
            }
          );
        } else {
            await Cart.updateOne(
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
      
        // 5) Return enriched cart (so FE can optionally replace local)
        const cart = await this.readCart(customerId);
        return { message: "Product added to cart", cart };
    };

    static readCart = async(req) => {
        const customerId = req.userId;

        // 1. Check customer
        const customer = await User.findById(customerId);
        if(!customer) throw new AuthFailureError('You are not authenticated!');

        // 2. Get cart items
        const cart = await Cart.findOne({ customerId })
            .populate('items.productId', 'title price images')
            .lean();
        if (!cart) throw new NotFoundError('Cart not found');
        // 3. Return cart items
        return {
            cart
        }
    }

    static readCart = async (customerId) => {
        const cart = await Cart.findOne({ customerId }).lean();
        if (!cart) return { items: [], version: 0 };
      
        const ids = cart.items.map((it) => it.productId);
        const products = await Product.find({ _id: { $in: ids } })
            .select("title price thumbnail stock")
            .lean();
      
        const byId = new Map(products.map((p) => [String(p._id), p]));
      
        return {
            items: cart.items.map((it) => {
                const p = byId.get(String(it.productId)) || {};
                return {
                    id: String(it.productId),
                    name: p.title,
                    price: p.price,
                    image: p.thumbnail,
                    stock: p.stock,
                    qty: it.quantity,
                };
            }),
            version: cart.version || 0,
        };
      };
}

export default CartService;
