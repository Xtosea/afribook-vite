// src/socket.js
import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("⚠ No token, socket not connected");
    return null;
  }

  if (!socket) {
    socket = io("https://afribook-backend.onrender.com", {
      auth: { token },
      transports: ["polling"], // ✅ Polling only for Render
      withCredentials: true,
    });

    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
    socket.on("connect_error", (err) => console.error("❌ Socket.IO error:", err.message));
    socket.on("disconnect", (reason) => console.log("🔴 Socket disconnected:", reason));
  }

  return socket;
};

export const getSocket = () => socket;