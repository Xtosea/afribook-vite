import { io } from "socket.io-client";

export const socket = io("https://afribook-backend.onrender.com", {
  transports: ["polling", "websocket"], // keep polling first for fallback
  withCredentials: true, // if you use cookies/auth
});

socket.on("connect", () => {
  console.log("Connected!", socket.id); // should log the SID
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});