// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Gia Hy
// ID: S4053650

import mongoose from "mongoose";

const DOCUMENT_NAME = "DistributionHub";
const COLLECTION_NAME = "DistributionHubs";

const DistributionHubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      unique: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      unique: true,
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

const DistributionHub = mongoose.model(DOCUMENT_NAME, DistributionHubSchema);
export default DistributionHub;
