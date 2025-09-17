// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Luu Quoc Phap
// ID: S4024611

import mongoose from "mongoose";
import { Schema } from "mongoose";

const DOCUMENT_NAME = "ForgotPasswordOTP";
const COLLECTION_NAME = "ForgotPasswordOTPs";

const forgotPasswordOTPSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    otp: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    expiredAt: {
      type: Date,
      required: true,
      index: { expires: 1800 }, // Expire after 1800 seconds (30 minutes)
    },
    requestCount: {
      type: Number,
      default: 0,
    },
    lastRequestDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

forgotPasswordOTPSchema.pre("save", function (next) {
  // Set expiredAt to 30 minutes (1800 seconds) in the future
  this.expiredAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  next();
});

const ForgotPasswordOTP = mongoose.model(
  DOCUMENT_NAME,
  forgotPasswordOTPSchema
);

export default ForgotPasswordOTP;
