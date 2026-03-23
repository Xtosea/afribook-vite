// src/socket.js
import { io } from "socket.io-client";

const token = localStorage.getItem("token"); // your JWT

export const socket = io("https://afribook-backend.onrender.com", {
  transports: ["polling", "websocket"], // polling first is crucial for Render
  auth: {
    token, // MUST be here
  },
});

socket.on("connect", () => {
  console.log("🟢 Connected!", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("❌ Socket connect error:", err.message);
});