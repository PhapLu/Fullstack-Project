import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";
import {
    AuthFailureError,
    BadRequestError,
    NotFoundError,
} from "../core/error.response.js";

const DEFAULT_THUMB = "/public/default-bg.png";

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
        const user = await User.findById(userId).select("_id");
        if (!user) throw new AuthFailureError("Please login to continue");

        // 2) Fetch conversations with all required populated fields
        const conversations = await Conversation.find({
            "members.user": userId,
        })
            .populate(
                "members.user",
                "role vendorProfile customerProfile avatar"
            )
            .sort({ updatedAt: -1 });

        // 3) Format conversations
        const resolved = conversations.map((c) => {
            const type = c.type || "";
            let title = "Conversation";
            let thumbnail = c.thumbnail || DEFAULT_THUMB;

            const members = (c.members || []).map((m) => {
                const u = m.user;
                return {
                    _id: u._id,
                    role: u.role,
                    avatar: u.avatar,
                    vendorProfile: u.vendorProfile || null,
                    customerProfile: u.customerProfile || null,
                };
            });

            // Determine "other member" for direct conversations
            const otherUser = c.members.find(
                (m) => m.user._id.toString() !== userId.toString()
            )?.user;

            if (type === "") {
                // === Direct message (1-on-1) ===
                if (otherUser) {
                    title =
                        (otherUser.role === "vendor" &&
                            otherUser.vendorProfile?.businessName) ||
                        (otherUser.role === "customer" &&
                            otherUser.customerProfile?.name) ||
                        "Unknown user";

                    thumbnail = otherUser.avatar || DEFAULT_THUMB;
                }
            }

            // Get the last message
            const lastMessage =
                c.messages?.length > 0
                    ? c.messages[c.messages.length - 1]
                    : null;

            return {
                _id: c._id,
                type,
                title,
                thumbnail,
                lastMessage,
                updatedAt: c.updatedAt,
                createdAt: c.createdAt,
                members,
            };
        });

        return { conversations: resolved };
    };

    static readMessages = async (req) => {
        const userId = req.userId;
        const { conversationId } = req.params;

        const limit = Math.max(
            1,
            Math.min(parseInt(req.query.limit) || 10, 50)
        );
        // If `before` not provided, we default to now → load newest "older" page
        const before = req.query.before
            ? new Date(req.query.before)
            : new Date();

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

        // 2. Fetch conversation with full profiles
        const conversation = await Conversation.findById(conversationId)
            .populate(
                "members.user",
                "_id role vendorProfile customerProfile fullName domainName avatar stageName"
            )
            .populate(
                "messages.senderId",
                "_id role fullName domainName avatar"
            )
            .select({
                messages: { $slice: -10 }, // last 10 messages
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
            throw new AuthFailureError("You are not allowed to access this conversation");
        }

        // 4. Resolve header data
        let thumbnail = DEFAULT_THUMB;
        let title = "";
        let subTitle = "";
        let titleUrl = "";
        let otherMember = null;

        // === Direct chat ===
        otherMember = conversation.members.find(
            (m) => m.user._id.toString() !== userId.toString()
        )?.user;

        if (otherMember) {
            title =
                (otherMember.role === "vendor" &&
                    otherMember.vendorProfile?.businessName) ||
                (otherMember.role === "customer" &&
                    otherMember.customerProfile?.name) ||
                otherMember.fullName ||
                otherMember.domainName ||
                "Unknown User";

            // ✅ Always use otherMember.avatar for direct chats
            thumbnail = otherMember.avatar || DEFAULT_THUMB;
            titleUrl = otherMember.domainName || "";
            subTitle =
                otherMember.role === "vendor"
                    ? otherMember.vendorProfile?.businessAddress || ""
                    : otherMember.role === "customer"
                    ? `@${otherMember.stageName || otherMember.fullName}`
                    : "";
        }

        // 5. Find current user info
        const memberInfo = conversation.members.find(
            (m) => m.user._id.toString() === userId.toString()
        );

        // 6. Return formatted conversation
        return {
            conversation: {
                ...conversation,
                thumbnail,
                title,
                subTitle,
                titleUrl,
                otherMember,
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
            throw new NotFoundError(
                "Conversation not found or you are not a member"
            );
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

            if (!conversation)
                throw new NotFoundError("Conversation not found");

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
                return res
                    .status(404)
                    .json({ message: "Conversation not found" });
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
        const { conversationId, otherUserId, content } = req.body;

        if (!otherUserId && !conversationId) {
            throw new BadRequestError(
                "Provide either conversationId or otherUserId"
            );
        }
        if (!content && (!req.files?.media || req.files.media.length === 0)) {
            throw new BadRequestError("Please provide content or media");
        }

        let conversation;

        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
            if (!conversation)
                throw new NotFoundError("Conversation not found");
        } else {
            // Check if conversation already exists between the two users
            conversation = await Conversation.findOne({
                "members.user": { $all: [userId, otherUserId] },
                type: "", // direct chat
            });

            if (!conversation) {
                conversation = new Conversation({
                    members: [{ user: userId }, { user: otherUserId }],
                    messages: [],
                    type: "",
                });
                await conversation.save();
            }
        }

        // handle media uploads
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

        const newMessage = {
            senderId: userId,
            content,
            createdAt: new Date(),
            media,
            seenBy: [userId],
        };

        conversation.messages.push(newMessage);
        await conversation.save();

        return {
            conversationId: conversation._id, // ✅ FE must persist this
            newMessage,
        };
    };
}

export default ConversationService;
