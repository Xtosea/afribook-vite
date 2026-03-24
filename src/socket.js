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
    socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    console.log("✅ Socket connected:", socket.id);
  }

  return socket;
};

// ✅ THIS is what you were missing
export const getSocket = () => socket;