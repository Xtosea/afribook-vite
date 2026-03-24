import React, { useEffect } from "react";
import { connectSocket } from "../socket";

const Messages = () => {
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    // Join user room for private messaging
    const userId = localStorage.getItem("userId");
    socket.emit("join", userId);

    // Listen for messages
    socket.on("receive-message", (message) => {
      console.log("New message:", message);
    });

    // Clean up on unmount
    return () => socket.disconnect();
  }, []);

  return <div>Messages Page</div>;
};

export default Messages;