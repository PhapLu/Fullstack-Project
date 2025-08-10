import Conversation from "../models/conversation.model.js";

const userSockets = new Map(); // userId -> [ws]

function send(ws, event, data) {
	ws.send(JSON.stringify({ event, data }));
}

function sendToUser(userId, event, data) {
	const sockets = userSockets.get(userId) || [];
	sockets.forEach(ws => {
		if (ws.readyState === 1) send(ws, event, data);
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

			if (event === "addUser") {
				userId = data;
				const sockets = userSockets.get(userId) || [];
				userSockets.set(userId, [...sockets, ws]);
			}

			if (event === "sendMessage") {
				const { receiverId } = data;
				sendToUser(receiverId, "getMessage", data);
			}

			if (event === "messageSeen") {
				const { conversationId, userId, senderId } = data;
				const conv = await Conversation.findById(conversationId);
				if (!conv) return;

				let changed = false;
				for (const msg of conv.messages) {
					if (msg.senderId.toString() === senderId && !msg.isSeen) {
						msg.isSeen = true;
						changed = true;
					}
				}

				if (changed) {
					await conv.save();
					sendToUser(senderId, "messageSeen", {
						conversationId,
						senderId: userId,
					});
				}
			}
		});

		ws.on("close", () => {
			if (!userId) return;
			const sockets = userSockets.get(userId) || [];
			const filtered = sockets.filter(s => s !== ws);
			if (filtered.length) userSockets.set(userId, filtered);
			else userSockets.delete(userId);
		});
	}
}

export default new SocketServices();
