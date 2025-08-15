import express from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../../auth/checkAuth.js"
import { verifyToken } from "../../middlewares/jwt.middelware.js"
import Review from "../../models/review.model.js"
import { requireOwner } from '../../middlewares/ownership.middleware.js'; 
import { createReview, listReviews, getReview, updateReview, deleteReview } from "../../controllers/review.controller.js";

const router = express.Router();

const validateCreate = (req, res, next) => {
    const { orderId, productId, rating, comment, images } = req.body;
    const errs = [];
    if (!mongoose.isValidObjectId(orderId))  errs.push('orderId is invalid');
    if (!mongoose.isValidObjectId(productId)) errs.push('productId is invalid');
    if (!(Number.isInteger(rating) && rating >= 1 && rating <= 5)) errs.push('rating must be int 1..5');
    if (!(typeof comment === 'string' && comment.trim().length >= 5 && comment.length <= 1000))
      errs.push('comment must be 5..1000 chars');
    if (images !== undefined && (!Array.isArray(images) || images.length > 5))
      errs.push('images must be an array (<=5)');
    return errs.length ? res.status(400).json({ errors: errs }) : next();
  };
  
  const validateUpdate = (req, res, next) => {
    if ('orderId' in req.body || 'productId' in req.body || 'customerId' in req.body)
      return res.status(400).json({ message: 'orderId/productId/customerId cannot be updated' });
  
    const { rating, comment, images } = req.body;
    const errs = [];
    if (rating !== undefined && !(Number.isInteger(rating) && rating >= 1 && rating <= 5))
      errs.push('rating must be int 1..5');
    if (comment !== undefined && !(typeof comment === 'string' && comment.trim().length >= 5 && comment.length <= 1000))
      errs.push('comment must be 5..1000 chars');
    if (images !== undefined && (!Array.isArray(images) || images.length > 5))
      errs.push('images must be an array (<=5)');
    return errs.length ? res.status(400).json({ errors: errs }) : next();
  };

router.get('/', asyncHandler(listReviews));
router.get('/:id', asyncHandler(getReview));

router.use(verifyToken);

router.post('/', validateCreate, asyncHandler(createReview));

router.patch(
    '/:id',
    validateCreate,
    asyncHandler(async (req, res, next) => {
        const doc = await Review.findById(req.params.id).select('customerId').lean();
        if (!doc) return res.status(404).json({ message: 'Not found' });
        req.ownerId = doc.customerId;
        next();
        }),
    requireOwner(req => req.ownerId),
    asyncHandler(updateReview)
);

router.delete(
    '/:id',
    asyncHandler(async (req,res, next) => {
        const doc = await Review.findById(req.params.id).select('customerId').lean();
        if (!doc) return res.status(404).json({ message: 'Not found' });
            req.ownerId = doc.customerId;
            next();
    }),
    requireOwner(req => req.ownerId),
    asyncHandler(deleteReview)
);

export default router;
