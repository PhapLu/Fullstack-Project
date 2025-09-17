// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Gia Hy
// ID: S4053650

import ReviewService from "../services/review.service.js";
import { SuccessResponse } from "../core/success.response.js";

class ReviewController {
  readReview = async (req, res, next) => {
    return new SuccessResponse({
      message: "Read review successfully",
      metadata: await ReviewService.readReview(req),
    }).send(res);
  };

  readReviews = async (req, res, next) => {
    return new SuccessResponse({
      message: "Read reviews by hub successfully",
      metadata: await ReviewService.readReviews(req),
    }).send(res);
  };

  createReview = async (req, res, next) => {
    return new SuccessResponse({
      message: "Update review status successfully",
      metadata: await ReviewService.createReview(req),
    }).send(res);
  };
}

export default new ReviewController();
