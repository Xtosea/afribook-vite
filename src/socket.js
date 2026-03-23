import { io } from "socket.io-client";

const token = localStorage.getItem("token");

export const socket = io("https://afribook-backend.onrender.com", {
  transports: ["polling", "websocket"], // polling first
  auth: { token }, // pass JWT if backend expects it
});

socket.on("connect", () => {
  console.log("Connected!", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("Socket connect error:", err.message);
});