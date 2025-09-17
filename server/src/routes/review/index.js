// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Gia Hy
// ID: S4053650

import { Router } from "express";
import reviewController from "../../controllers/review.controller.js";
import { verifyToken } from "../../middlewares/jwt.middleware.js";

const router = Router();

router.use(verifyToken);

router.post("/createReview", reviewController.createReview);
router.get("/readReviews/:productId", reviewController.readReviews);
router.get("/readReview/:reviewId", reviewController.readReview);

export default router;
