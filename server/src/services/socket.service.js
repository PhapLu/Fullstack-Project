import Conversation from "../models/conversation.model.js";
import mongoose from "mongoose";
const userSockets = new Map(); // userId -> [ws]

function send(ws, event, data) {
    ws.send(JSON.stringify({ event, data }));
}

function sendToUser(userId, event, data) {
    const sockets = userSockets.get(userId) || [];
    console.log(
        `📤 Attempting to send [${event}] to user ${userId}. Sockets found: ${sockets.length}`
    );
    sockets.forEach((ws) => {
        if (ws.readyState === 1) {
            ws.send(JSON.stringify({ event, data }));
        } else {
            console.warn(`⚠️ Socket not open for user ${userId}`);
        }
    });
}

function parse(msg) {
    try {
        return JSON.parse(msg);
    } catch {
        return {};
    }
}

class SocketServices {
    connection(ws) {
        let userId = null;

        ws.on("message", async (msg) => {
            const { event, data } = parse(msg);
            if (!event) return;

            // Register socket
            if (event === "addUser") {
                userId = data;
                const sockets = userSockets.get(userId) || [];
                userSockets.set(userId, [...sockets, ws]);
            
                console.log(`👤 User ${userId} registered. Total sockets: ${userSockets.get(userId).length}`);
                console.log("📊 Current connected userIds:", [...userSockets.keys()]);
            }            

            // Send message
            if (event === "sendMessage") {
                console.log("📨 Received sendMessage event:", data);
                const { conversationId, content, receiverId } = data;

                let conv = await Conversation.findById(conversationId);

                if (!conv) {
                    conv = new Conversation({
                        members: [
                            { user: new mongoose.Types.ObjectId(userId) },
                            { user: new mongoose.Types.ObjectId(receiverId) },
                        ],
                        messages: [],
                    });
                }

                const newMsg = {
                    senderId: new mongoose.Types.ObjectId(userId), // ✅ cast to ObjectId
                    content,
                    createdAt: new Date(),
                    isSeen: false,
                };

                conv.messages.push(newMsg);
                await conv.save();
                console.log("STAT SEND");
                // notify receiver
                sendToUser(receiverId, "getMessage", {
                    conversationId: conv._id,
                    message: newMsg,
                });

                // echo back to sender
                sendToUser(userId, "messageSent", {
                    conversationId: conv._id,
                    message: newMsg,
                });
            }

            // Mark messages as seen
            if (event === "messageSeen") {
                const { conversationId } = data;
                const conv = await Conversation.findById(conversationId);
                if (!conv) return;

                let changed = false;
                conv.messages.forEach((msg) => {
                    if (msg.senderId.toString() !== userId && !msg.isSeen) {
                        msg.isSeen = true;
                        changed = true;
                    }
                });

                if (changed) {
                    await conv.save();
                    // notify other member(s)
                    conv.members.forEach((m) => {
                        if (m.user.toString() !== userId) {
                            sendToUser(m.user.toString(), "messagesSeen", {
                                conversationId,
                                seenBy: userId,
                            });
                        }
                    });
                }
            }
        });

        ws.on("close", () => {
            if (!userId) return;
            const sockets = userSockets.get(userId) || [];
            const filtered = sockets.filter((s) => s !== ws);
            if (filtered.length) userSockets.set(userId, filtered);
            else userSockets.delete(userId);
        });
    }
}

export default new SocketServices();
