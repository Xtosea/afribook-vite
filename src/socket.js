// src/socket.js
import { io } from "socket.io-client";

let socket = null;

/**
 * Connect to the backend Socket.IO server
 * Call this once on app load (e.g., in App.jsx useEffect)
 */
export const connectSocket = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("⚠ No token found, socket not connected");
    return null;
  }

  if (!socket) {
    socket = io("https://afribook-backend.onrender.com", { // ✅ Backend URL
      auth: { token },
      transports: ["polling"], // ✅ Use polling only for Render
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket.IO error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
    });
  }

  return socket;
};

/**
 * Get the connected socket instance
 */
export const getSocket = () => socket;