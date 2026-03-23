// src/socket.js
import { io } from "socket.io-client";

export const socket = io("https://africbook.globelynks.com", {
  transports: ["websocket"],
});