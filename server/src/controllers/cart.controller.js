import CartService from '../services/cart.service.js'
import { SuccessResponse } from "../core/success.response.js"

class CartController {
    readCart = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Read cart successfully',
            metadata: await CartService.readCart(req)
        }).send(res)
    }

    addToCart = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Product added to cart successfully',
            metadata: await CartService.addToCart(req)
        }).send(res)
    }

    removeFromCart = async (req, res, next) => {
        return new SuccessResponse({
            message: 'Product removed from cart successfully',
            metadata: await CartService.removeFromCart(req)
        }).send(res)
    }
}

export default new CartController()