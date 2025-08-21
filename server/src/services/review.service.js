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
  static createReview = async(req) => {
    const userId = req.userId
    const body = req.body

    // 1. Check user, order, product
    const user = await User.findById(userId)
    if(!user) throw new AuthFailureError('You are not authenticated!')

    const order = await Order.findById(body.orderId)
    if(!order) throw new NotFoundError('Order not found')
        
    const product = await Product.findById(order.productId)
    if(!product) throw new NotFoundError('Product not found')
    if(userId !== order.customerId) throw new BadRequestError('You can not review for this product')
    if(product.vendorId !== order.vendorId) throw new BadRequestError('You can not revew this product')
    
    // 2. Validate body

    // 3. Create review
    const review = await Review.create({
        ...body
    })
    await review.save()
    return {
        message: "Create review successfully"
    }
  }
}

export default ReviewService;
