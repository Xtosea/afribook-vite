// src/socket.js (or wherever you keep socket code)
import { io } from "socket.io-client"; // ✅ Make sure this is at the top

const token = localStorage.getItem("token");

export const socket = io("https://afribook-backend.onrender.com", {
  transports: ["polling", "websocket"], // polling first for Render
  auth: { token }, // pass JWT