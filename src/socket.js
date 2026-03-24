// src/socket.js
import { io } from "socket.io-client";

let socket = null;

/**
 * Connect to backend Socket.IO server for protected routes
 */
export const connectSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("⚠ No token, Socket.IO not connected");
    return null;
  }

  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socket.on("connect", () => console.log("✅ Socket.IO connected:", socket.id));
    socket.on("connect_error", (err) => console.error("❌ Socket.IO error:", err.message));
    socket.on("disconnect", (reason) => console.log("🔴 Socket.IO disconnected:", reason));
  }

  return socket;
};

/**
 * Get the socket instance
 */
export const getSocket = () => socket;