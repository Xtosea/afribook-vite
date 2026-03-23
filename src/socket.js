import { io } from "socket.io-client";

export const socket = io("https://africbook.globelynks.com", {
  transports: ["websocket", "polling"], // MUST include both
  withCredentials: true,
});