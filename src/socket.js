// src/socket.js
import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("⚠ No token, socket not connected");
    return null;
  }

  socket = io("https://afribook-backend.onrender.com", {
    transports: ["polling", "websocket"], // Render-safe
    auth: {
      token,
    },
  });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected");
  });

  socket.on("connect_error", (err) => {
    console.log("❌ Socket error:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;