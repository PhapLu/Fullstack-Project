// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Luu Quoc Phap
// ID: S4024611

let socket = null;
let registeredUserId = null;

export function connectSocket(userId) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    if (registeredUserId !== userId) {
      socket.send(JSON.stringify({ event: "addUser", data: userId }));
      registeredUserId = userId;
    }
    return socket;
  }

  if (socket && socket.readyState === WebSocket.CONNECTING) {
    socket.addEventListener("open", () => {
      if (userId) {
        socket.send(JSON.stringify({ event: "addUser", data: userId }));
        registeredUserId = userId;
      }
    });
    return socket;
  }

  // Fresh socket
  socket = new WebSocket("ws://localhost:3000");

  socket.onopen = () => {
    if (userId) {
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
