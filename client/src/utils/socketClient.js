let socket = null;
let registeredUserId = null;

export function connectSocket(userId) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        if (registeredUserId !== userId) {
            console.log("👤 Re-registering user (already open):", userId);
            socket.send(JSON.stringify({ event: "addUser", data: userId }));
            registeredUserId = userId;
        }
        return socket;
    }

    if (socket && socket.readyState === WebSocket.CONNECTING) {
        console.log("⏳ Socket is still connecting. Will wait for onopen...");
        socket.addEventListener("open", () => {
            if (userId) {
                console.log("👤 Registering user (delayed):", userId);
                socket.send(JSON.stringify({ event: "addUser", data: userId }));
                registeredUserId = userId;
            }
        });
        return socket;
    }

    // Fresh socket
    socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
        console.log("✅ WebSocket connected");
        if (userId) {
            console.log("👤 Registering user:", userId);
            socket.send(JSON.stringify({ event: "addUser", data: userId }));
            registeredUserId = userId;
        } else {
            console.warn("⚠️ No userId available at connect time");
        }
    };

    socket.onerror = (e) => {
        console.error("❌ WebSocket error:", e);
    };

    socket.onclose = () => {
        console.warn("🔌 WebSocket closed.");
        registeredUserId = null;
    };

    return socket;
}

export function getSocket() {
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.close();
        socket = null;
        registeredUserId = null;
    }
}
