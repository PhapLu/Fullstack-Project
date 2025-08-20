import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";
import {
  AuthFailureError,
  BadRequestError,
  NotFoundError,
} from "../core/error.response.js";

const DEFAULT_THUMB = "/uploads/default-bg.png";

class ConversationService {
  static createConversation = async (userId, req) => {
    //1. Check user
    const user = await User.findById(userId).select("_id");
    if (!user) throw new AuthFailureError("Please login to continue");

    //2. Validate request body
    const { otherMemberId, content } = req.body;
    if (!otherMemberId)
      throw new BadRequestError("Please provide required fields");
    if (!content && (!req.files.media || req.file.media.length == 0))
      throw new BadRequestError("Please provide content or media");

    //3. Upload media
    try {
      let media = [];

      if (req.files && req.files.media) {
        const uploadPromises = req.files.media.map((file) =>
          uploadImageToS3({
            buffer: file.buffer,
            originalname: file.originalname,
            width: 1920,
            height: 1080,
          })
        );
        const uploadResults = await Promise.all(uploadPromises);
        media = uploadResults.map((result) => result.result.Key);
      }

      //4. Create conversation
      const conversation = new Conversation({
        members: [{ user: userId }, { user: req.body.otherMemberId }],
        messages: [
          {
            senderId: userId,
            content,
            createdAt: new Date(),
            media,
          },
        ],
      });
      await conversation.save();

      return {
        message: "Conversation created successfully",
      };
    } catch (error) {
      console.error("Error uploading images:", error);
      throw new Error("File upload or database save failed");
    }
  };

  static readConversations = async (userId) => {
    // 1) Validate user
    const user = await User.findById(userId).select("_id").lean();
    if (!user) throw new AuthFailureError("Please login to continue");

    // 2) Fetch conversations the user belongs to
    const conversations = await Conversation.find({
      "members.user": userId,
    })
      .populate("members.user", "fullName avatar domainName")
      .populate("galaxyId", "title avatar")
      .populate("roleplayRoomId", "title artworks")
      .sort({ updatedAt: -1 })
      .lean();

    // 3) Compute title, thumbnail, and lastMessage
    const resolved = conversations.map((c) => {
      const type = c.type || "";
      let title = "";
      let thumbnail = c.thumbnail || DEFAULT_THUMB;
      let otherMember = null;

      if (type === "") {
        // Direct chat
        const others = (c.members || []).filter(
          (m) => m?.user?._id?.toString() !== userId.toString()
        );

        if (others.length === 1) {
          const u = others[0]?.user;
          otherMember = u
            ? {
                _id: u._id,
                fullName: u.fullName,
                domainName: u.domainName,
                avatar: u.avatar,
              }
            : null;

          title =
            u?.fullName?.trim() || u?.domainName?.trim() || "Unknown user";
          thumbnail = u?.avatar || thumbnail || DEFAULT_THUMB;
        } else {
          const names = others
            .map((m) => m?.user?.fullName || m?.user?.domainName)
            .filter(Boolean)
            .slice(0, 3);
          title = names.length ? names.join(", ") : "Direct conversation";
        }
      } else if (type === "roleplayRoom") {
        title = c.roleplayRoomId?.title || "Untitled Roleplay Room";
        thumbnail =
          c.thumbnail || c.roleplayRoomId?.artworks?.[0] || DEFAULT_THUMB;
      } else if (type === "galaxy") {
        title = c.galaxyId?.title || "Untitled Galaxy";
        thumbnail = c.thumbnail || c.galaxyId?.avatar || DEFAULT_THUMB;
      } else {
        title = "Conversation";
        thumbnail = c.thumbnail || DEFAULT_THUMB;
      }

      // Get the last message safely
      const lastMessage =
        (c.messages &&
          c.messages.length &&
          c.messages[c.messages.length - 1]) ||
        null;

      return {
        _id: c._id,
        type,
        title,
        thumbnail,
        lastMessage, // includes senderId, content, createdAt, etc.
        updatedAt: c.updatedAt,
        createdAt: c.createdAt,
        members: (c.members || []).map((m) => ({
          _id: m?.user?._id,
          fullName: m?.user?.fullName,
          domainName: m?.user?.domainName,
          avatar: m?.user?.avatar,
        })),
        ...(type === "" && otherMember ? { otherMember } : {}),
      };
    });

    return { conversations: resolved };
  };

  static readMessages = async (req) => {
    const userId = req.userId;
    const { conversationId } = req.params;

    const limit = Math.max(1, Math.min(parseInt(req.query.limit) || 10, 50));
    // If `before` not provided, we default to now → load newest "older" page
    const before = req.query.before ? new Date(req.query.before) : new Date();

    // 1) Validate user
    const user = await User.findById(userId).select("_id");
    if (!user) throw new AuthFailureError("Please login to continue");

    // 2) Check membership quickly
    const conv = await Conversation.findById(conversationId).select(
      "_id members"
    );
    if (!conv) throw new NotFoundError("Conversation not found");
    const isMember = conv.members.some(
      (m) =>
        m.user.toString() === userId.toString() ||
        m.user?._id?.toString() === userId.toString()
    );
    if (!isMember)
      throw new AuthFailureError(
        "You are not allowed to access this conversation"
      );

    // 3) Aggregate to filter embedded messages older than `before`, return last `limit` of that subset
    const [result] = await Conversation.aggregate([
      { $match: { _id: conv._id } },
      {
        $project: {
          messages: {
            $filter: {
              input: "$messages",
              as: "m",
              cond: { $lt: ["$$m.createdAt", before] },
            },
          },
        },
      },
      // Take the last `limit` messages from that filtered subset
      { $project: { messages: { $slice: ["$messages", -limit] } } },
    ]);

    const messages = result?.messages || [];

    // Populate senderId & seenBy for those message docs
    // (Mongoose can populate plain objects too)
    await User.populate(messages, [
      { path: "senderId", select: "_id domainName fullName avatar" },
      { path: "seenBy", select: "_id fullName avatar" },
    ]);

    // 4) Compute hasMore by counting whether there remain messages older than the oldest returned
    let hasMore = false;
    let nextCursor = null;
    if (messages.length > 0) {
      const oldest = messages[0].createdAt; // because we sliced from the end; order may be ascending within slice
      nextCursor = oldest;

      const [rem] = await Conversation.aggregate([
        { $match: { _id: conv._id } },
        {
          $project: {
            olderCount: {
              $size: {
                $filter: {
                  input: "$messages",
                  as: "m",
                  cond: { $lt: ["$$m.createdAt", oldest] },
                },
              },
            },
          },
        },
      ]);
      hasMore = (rem?.olderCount || 0) > 0;
    }

    // Ensure messages are sorted chronological ASC for the UI
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return {
      messages,
      hasMore,
      nextCursor, // ISO string on the frontend using messages[0].createdAt if needed
    };
  };

  static readConversation = async (req) => {
    const userId = req.userId;
    const { conversationId } = req.params;

    // 1. Validate user exists
    const user = await User.findById(userId).select("_id");
    if (!user) throw new AuthFailureError("Please login to continue");

    // 2. Fetch conversation
    const conversation = await Conversation.findById(conversationId)
      .populate("members.user", "_id fullName domainName avatar stageName")
      .populate("messages.senderId", "_id domainName fullName avatar")
      .populate("messages.seenBy", "_id fullName avatar")
      .populate("roleplayRoomId", "_id title participants")
      .populate("galaxyId", "_id title membersCount")
      .select({
        messages: { $slice: -10 }, // fetch last 10 messages only
      })
      .lean();

    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    // 3. Check membership
    const isMember = conversation.members.some(
      (m) => m.user._id.toString() === userId.toString()
    );
    if (!isMember) {
      throw new AuthFailureError(
        "You are not allowed to access this conversation"
      );
    }

    // 4. Handle thumbnail + title logic
    let thumbnail = conversation.thumbnail;
    let title = "";
    let titleUrl = "";
    let subTitle = "";

    if (conversation.type === "") {
      // direct: use other member’s data
      const otherMember = conversation.members.find(
        (m) => m.user._id.toString() !== userId.toString()
      );
      if (otherMember?.user) {
        thumbnail = otherMember.user.avatar || thumbnail;
        title = otherMember.user.fullName || "Unknown User";
        titleUrl = otherMember.user.domainName;
        subTitle = `@${otherMember.user.stageName}`;
      }
    } else if (conversation.type === "roleplayRoom") {
      thumbnail = conversation.thumbnail; // or conversation.roleplayRoomId?.thumbnail if you prefer
      title = conversation.roleplayRoomId?.title || "Untitled Roleplay Room";
      // titleUrl = conversation.roleplayRoomId.domainName;
      subTitle = `${conversation.roleplayRoomId?.participants?.length} members`;
    } else if (conversation.type === "galaxy") {
      thumbnail = conversation.thumbnail; // or conversation.galaxyId?.thumbnail if you prefer
      title = conversation.galaxyId?.title || "Untitled Galaxy";
      subTitle = `${conversation.galaxyId?.membersCount} members`;
    }

    const memberInfo = conversation.members.find(
      (m) => m.user._id.toString() === userId.toString()
    );

    // 5. Return conversation with resolved title + thumbnail
    return {
      conversation: {
        ...conversation,
        thumbnail,
        title,
        subTitle,
        titleUrl,
        isMuted: memberInfo?.isMuted || false,
      },
    };
  };

  static toggleMuteConversation = async (req) => {
    const userId = req.userId;
    const { conversationId } = req.params;
    const { isMuted } = req.body; // boolean

    // 1. Check membership
    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, "members.user": userId },
      { $set: { "members.$.isMuted": isMuted } },
      { new: true }
    ).populate("members.user", "_id fullName avatar");

    if (!conversation) {
      throw new NotFoundError("Conversation not found or you are not a member");
    }

    return { conversationId, isMuted };
  };

  static readConversationWithOtherMember = async (userId, otherMemberId) => {
    try {
      // 1. Check user and other member
      const user = await User.findById(userId).select("_id");
      const otherMember = await User.findById(otherMemberId).select(
        "fullName avatar domainName"
      );
      if (!user) throw new AuthFailureError("Please login to continue");
      if (!otherMember) throw new BadRequestError("Something went wrong");

      // 2. Read conversation
      const conversation = await Conversation.findOne({
        "members.user": {
          $all: [userId, otherMemberId],
        },
      }).populate("members.user", "fullName avatar domainName");

      if (!conversation) throw new NotFoundError("Conversation not found");

      // 3. Mark all messages from otherMember as seen
      let updated = false;
      conversation.messages.forEach((message) => {
        if (message.senderId.toString() !== userId && !message.isSeen) {
          message.isSeen = true;
          updated = true;
        }
      });

      if (updated) {
        await conversation.save();
      }

      // 4. Format conversation
      const sortedMessages = conversation.messages
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10)
        .reverse(); // Reverse to maintain ascending order

      const formattedConversation = {
        _id: conversation._id,
        messages: sortedMessages,
        otherMember: {
          _id: otherMember._id,
          fullName: otherMember.fullName,
          avatar: otherMember.avatar,
          domainName: otherMember.domainName,
        },
      };

      return {
        conversation: formattedConversation,
      };
    } catch (error) {
      console.error("Error in readConversationWithOtherMember:", error);
      throw new Error("Failed to read conversation");
    }
  };

  // Route: GET /conversation/fetchOlderMessages
  static fetchOlderMessages = async (userId, req) => {
    //1. Check user
    const user = await User.findById(userId).select("_id");
    if (!user) throw new AuthFailureError("Please login to continue");

    //2. Fetch older message
    const { conversationId, beforeMessageId, limit } = req.query;
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const index = conversation.messages.findIndex(
        (msg) => msg._id.toString() === beforeMessageId
      );
      const olderMessages = conversation.messages.slice(
        Math.max(index - limit, 0),
        index
      );

      return { messages: olderMessages.reverse() };
      // return res.status(200).json({ messages: olderMessages.reverse() });
    } catch (error) {
      console.error("Error in fetchOlderMessages:", error);
      return res
        .status(500)
        .json({ message: "Failed to fetch older messages" });
    }
  };

  static sendMessage = async (req) => {
    const userId = req.userId;
    const { conversationId, otherUserId } = req.body;
    let conversation;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) throw new NotFoundError("Conversation not found");
    } else {
      const otherUser = await User.findById(otherUserId);
      if (!otherUser) throw new NotFoundError("Not found other member");

      conversation = new Conversation({
        members: [{ user: otherUser }, { user: otherUserId }],
        messages: [],
      });
      await conversation.save();
    }

    const { content } = req.body;
    if (!content && (!req.files.media || req.files.media.length === 0)) {
      throw new BadRequestError("Please provide content or media");
    }

    let media = [];
    if (req.files && req.files.media) {
      const uploadPromises = req.files.media.map((file) =>
        uploadImageToS3({
          buffer: file.buffer,
          originalname: file.originalname,
          width: 1920,
          height: 1080,
        })
      );
      const uploadResults = await Promise.all(uploadPromises);
      media = uploadResults.map((r) => r.result.Key);
    }

    // Push new message with seenBy = [sender]
    const newMessage = {
      senderId: userId,
      content: req.body.content,
      createdAt: new Date(),
      media,
      seenBy: [userId],
    };

    conversation.messages.push(newMessage);
    await conversation.save();

    // ✅ Find the receiver (the other member)
    const receiverMember = conversation.members.find(
      (m) => m.user.toString() !== userId.toString()
    );

    if (receiverMember) {
      // Load full receiver user info
      const receiver = await User.findById(receiverMember.user).select(
        "fullName avatar email activity"
      );
    }

    return {
      conversation,
      newMessage,
    };
  };
}

export default ConversationService;
