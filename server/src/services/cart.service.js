import { AuthFailureError, BadRequestError, NotFoundError } from "../core/error.response.js"
import Cart from "../models/cart.model.js"
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

class CartService {
    //-------------------CRUD----------------------------------------------------
    static addToCart = async(req) => {
        const customerId = req.userId
        const { productId, quantity } = req.body;

        // 1. Validate inputs
        if (!productId || !quantity || quantity < 1) {
            throw new BadRequestError('Product ID and quantity are required');
        }

        // 2. Check customer and product
        const customer = await User.findById(customerId);
        const product = await Product.findById(productId);

        if (!customer) throw new AuthFailureError('You are not authenticated!');
        if(!product) throw new NotFoundError('Product not found');

        // 3. Add product to cart
        await Cart.findOneAndUpdate(
            { customerId },
            { $addToSet: { items: { productId, quantity } } },
            { new: true, upsert: true }
        );

        return {
            message: 'Product added to cart successfully',
        };
    }

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

    static removeFromCart = async(req) => {
        const customerId = req.userId;
        const { productId } = req.body;

        // 1. Validate inputs
        if (!productId) throw new BadRequestError('Product ID is required');

        // 2. Check customer
        const customer = await User.findById(customerId);
        if(!customer) throw new AuthFailureError('You are not authenticated!');

        // 3. Remove product from cart
        const cart = await Cart.findOneAndUpdate(
            { customerId },
            { $pull: { items: { productId } } },
            { new: true }
        );

        if (!cart) throw new NotFoundError('Cart not found');

        return {
            message: 'Product removed from cart successfully',
        };
    }
}

export default CartService;
