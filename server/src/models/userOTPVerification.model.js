// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Luu Quoc Phap
// ID: S4024611

import mongoose from "mongoose";
const { Schema } = mongoose;

const DOCUMENT_NAME = "UserOTPVerification";
const COLLECTION_NAME = "UserOTPVerifications";

const CustomerProfileSchema = new Schema(
  {
    name: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const VendorProfileSchema = new Schema(
  {
    businessName: { type: String, trim: true },
    businessAddress: { type: String, trim: true },
  },
  { _id: false }
);

const ShipperProfileSchema = new Schema(
  {
    assignedHub: { type: Schema.Types.ObjectId, ref: "DistributionHub" },
  },
  { _id: false }
);

const UserOTPVerificationSchema = new Schema(
  {
    // kept fields
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    // NEW: all data to create final User
    username: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: ["customer", "vendor", "shipper"],
    },
    avatar: { type: String, required: true, trim: true }, // file path
    password: { type: String, required: true },

    customerProfile: { type: CustomerProfileSchema },
    vendorProfile: { type: VendorProfileSchema },
    shipperProfile: { type: ShipperProfileSchema },

    otp: { type: String, required: true },

    expiredAt: {
      type: Date,
      required: true,
      index: { expires: 1800 }, // 30 minutes
    },
    requestCount: { type: Number, default: 0 },
    lastRequestDate: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

UserOTPVerificationSchema.pre("save", function (next) {
  this.expiredAt = new Date(Date.now() + 30 * 60 * 1000);
  next();
});

export default mongoose.models[DOCUMENT_NAME] ||
  mongoose.model(DOCUMENT_NAME, UserOTPVerificationSchema);
