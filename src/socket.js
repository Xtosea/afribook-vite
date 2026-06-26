// src/socket.js

import { io } from "socket.io-client";

const SOCKET_URL =
  "https://afribook-backend.onrender.com";

let socket = null;

export const connectSocket = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("⚠ No token, socket not connected");
    return null;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: {
        token,
      },

      // ✅ Render-friendly transport
      transports: ["websocket","polling"],

      // ✅ Allow cookies
      withCredentials: true,

      // ✅ Auto reconnect settings
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,

      // ✅ Timeout
      timeout: 20000,
      
      autoConnect: true,
      forceNew: false,
    });

    // ✅ Connected
    socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);

  const user = JSON.parse(localStorage.getItem("user"));

  console.log("LocalStorage user:", user);

  if (user?._id) {
    socket.emit("join", user._id);
    console.log("👤 Joined room:", user._id);
  } else {
    console.log("❌ No user found in localStorage");
  }
});

    // ❌ Error
    socket.on("connect_error", (err) => {
      console.error("❌ Socket.IO error:", err.message);
    });

    // 🔴 Disconnected
    socket.on("disconnect", (reason) => {
  console.log("🔴 Socket disconnected:", reason);

  if (reason === "transport close") {
    socket.connect();
  }
});

    // 🔄 Reconnecting
    socket.on("reconnect_attempt", (attempt) => {
      console.log("🔄 Socket reconnect attempt:", attempt);
    });

    // ✅ Reconnected
    socket.on("reconnect", (attempt) => {
      console.log("✅ Socket reconnected after", attempt, "attempts");
    });

    // ❌ Failed reconnect
    socket.on("reconnect_failed", () => {
      console.log("❌ Socket reconnect failed");
    });
  }

  return socket;
};

// ✅ Get existing socket anywhere
export const getSocket = () => socket;

// ✅ Disconnect manually (logout use)
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket manually disconnected");
  }
};


// ✅ SAFE DEBUG EMIT
export const safeEmit = (event, data) => {
  console.log("📡 TRYING EMIT:", event);

  const s = getSocket();

  console.log("🧩 SOCKET STATUS:", {
    exists: !!s,
    connected: s?.connected,
    id: s?.id,
  });

  if (!s) {
    console.log("❌ EMIT BLOCKED — socket is null");
    return false;
  }

  if (!s.connected) {
    console.log("❌ EMIT BLOCKED — socket not connected");
    return false;
  }

  try {
    s.emit(event, data);

    console.log("✅ EMIT SUCCESS:", event);

    return true;
  } catch (err) {
    console.error("❌ EMIT CRASH:", event, err);

    return false;
  }
};