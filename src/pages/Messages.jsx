import React, { useEffect, useState } from "react";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import { getSocket } from "../socket";

const Messages = () => {
  const currentUserId = localStorage.getItem("userId");

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
  const socket = getSocket();
  if (!socket) return;

  socket.emit("join", currentUserId);

  const handleReceiveMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  socket.on("receive-message", handleReceiveMessage);

  return () => {
    socket.off("receive-message", handleReceiveMessage);
  };
}, [currentUserId]);

  return (
    <div className="h-screen flex bg-gray-100">

      {/* LEFT SIDEBAR */}
      <ChatSidebar onSelectUser={setSelectedUser} />

      {/* CHAT WINDOW */}
      <ChatWindow
        selectedUser={selectedUser}
        messages={messages}
        setMessages={setMessages}
      />

    </div>
  );
};

export default Messages;