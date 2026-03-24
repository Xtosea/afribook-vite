import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (!socket) {
    socket = io("https://afribook-backend.onrender.com", {
      auth: { token },
      transports: ["polling"], // ✅ Polling only
      withCredentials: true,
    });

    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
    socket.on("disconnect", (reason) => console.log("🔴 Socket disconnected:", reason));
    socket.on("connect_error", (err) => console.error("❌ Socket.IO error:", err.message));
  }

  return socket;
};