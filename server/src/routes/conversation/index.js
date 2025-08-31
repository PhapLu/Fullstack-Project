import express from "express";
import { asyncHandler } from "../../auth/checkAuth.js";
import conversationController from "../../controllers/conversation.controller.js";
import { verifyToken } from "../../middlewares/jwt.middleware.js";

const router = express.Router();

//authentication
router.use(verifyToken);

router.post(
  "/createConversation",
  asyncHandler(conversationController.createConversation)
);
router.get(
  "/readConversationWithOtherMember/:otherMemberId",
  asyncHandler(conversationController.readConversationWithOtherMember)
);
router.get(
  "/readConversation/:conversationId",
  asyncHandler(conversationController.readConversation)
);
router.patch(
  "/toggleMuteConversation/:conversationId",
  asyncHandler(conversationController.toggleMuteConversation)
);
router.get(
  "/readConversation/:conversationId/readMessages",
  asyncHandler(conversationController.readMessages)
);
router.get(
  "/readConversations",
  asyncHandler(conversationController.readConversations)
);
router.patch(
  "/sendMessage",
  asyncHandler(conversationController.sendMessage)
);
router.get(
  "/fetchOlderMessages",
  asyncHandler(conversationController.fetchOlderMessages)
);

export default router;
