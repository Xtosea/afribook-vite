// src/socket.js

import { io } from "socket.io-client";
import { API_BASE } from "./api/api";

let socket = null;

export const connectSocket = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("⚠ No token, socket not connected");
    return null;
  }

  if (!socket) {
    socket = io(API_BASE, {
      auth: {
        token,
      },

      // ✅ Render-friendly transport
      transports: ["polling"],

      // ✅ Allow cookies
      withCredentials: true,

      // ✅ Auto reconnect settings
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,

      // ✅ Timeout
      timeout: 20000,
    });

    // ✅ Connected
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    // ❌ Error
    socket.on("connect_error", (err) => {
      console.error("❌ Socket.IO error:", err.message);
    });

    // 🔴 Disconnected
    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
    });

    // 🔄 Reconnecting
    socket.on("reconnect_attempt", (attempt) => {
      console.log("🔄 Socket reconnect attempt:", attempt);
    });

    // ✅ Reconnected
    socket.on("reconnect", (attempt) => {
      console.log("✅ Socket reconnected after", attempt, "attempts");
    });

    // ❌ Failed reconnect
    socket.on("reconnect_failed", () => {
      console.log("❌ Socket reconnect failed");
    });
  }

  return socket;
};

// ✅ Get existing socket anywhere
export const getSocket = () => socket;

// ✅ Disconnect manually (logout use)
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket manually disconnected");
  }
};