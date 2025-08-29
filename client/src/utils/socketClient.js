// utils/socketClient.js
import { io } from "socket.io-client";

let socket = null;

export function connectSocket(token) {
    if (socket?.connected) return socket;
    socket = io(
        import.meta.env.VITE_ENV === "production"
            ? import.meta.env.VITE_SERVER_ORIGIN
            : import.meta.env.VITE_SERVER_LOCAL_ORIGIN,
        { auth: { token }, transports: ["websocket"] }
    );
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export function getSocket() {
    return socket;
}
