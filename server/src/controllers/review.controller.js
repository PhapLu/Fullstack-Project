import Review from '../models/review.model.js';
import { verifyPurchased } from '../services/reviewVerify.service.js';

const reasonMsg = {
    invalid_ids: 'Invalid ids',
    order_not_found_or_not_owner: 'Order not found or not owned by user',
    order_not_delivered: 'Order is not delivered',
    product_not_in_order: 'Product not found in this order',
};

export async function createReview(req, res) {
    const customerId = req.userId;
    const { orderId, productId, rating, comment, images } = req.body;

    const check = await verifyPurchased({ orderId, customerId, productId });
    if (!check.ok) {
        return res.status(400).json({ message: reasonMsg[check.reason] || 'Not eligible to review'});
    }

    const doc = await Review.create({
        orderId, productId, customerId, rating, comment, images: images || [], isPublished: true
    });

    res.status(201).json(doc);
}

export async function listReviews(req, res) {
    const { productId, rating, page = 1, limit = 10, sort = 'createdAt' } = req.query;
    const filter = {};
    if (productId) filter.productId = productId;
    if (rating) filter.rating = Number(rating);

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
        Review.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
        Review.countDocuments(filter),
    ]);

    res.json({ page: Number(page), limit: Number(limit), total, items });
}

export async function getReview(req, res) {
    const doc = await Review.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
}

export async function updateReview(req, res) {
    const { id } = req.params;
    const updates = {};
    ['rating', 'comment', 'images'].forEach(k => {
        if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const doc = await Review.findByIdAndUpdate(id, updates, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });

    res.json(doc);
}

export async function deleteReview(req, res) {
    const { id } = req.params;
    const doc = await Review.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ message: 'Not found' });

    res.json({ message: 'Deleted' })
}