// src/socket.js
import { io } from "socket.io-client";

export const socket = io("https://media.africbook.globelynks.com", {
  transports: ["websocket"],
});