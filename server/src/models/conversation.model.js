// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Luu Quoc Phap
// ID: S4024611

import mongoose from "mongoose";

const DOCUMENT_NAME = "Conversation";
const COLLECTION_NAME = "Conversations";

const ConversationSchema = new mongoose.Schema(
  {
    members: [
      {
        user: {
          type: mongoose.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    messages: [
      {
        senderId: {
          type: mongoose.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: { type: String },
        media: { type: [String] },
        reaction: { type: [String] },
        createdAt: { type: Date, default: Date.now },
        isSeen: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

const Conversation = mongoose.model(DOCUMENT_NAME, ConversationSchema);
export default Conversation;
