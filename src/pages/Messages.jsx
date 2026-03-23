import React, { useEffect, useState } from "react";
import ChatSidebar from "../chat/components/chat/ChatSidebar";
import ChatWindow from "../chat/components/chat/ChatWindow";
import { socket } from "../socket";

const Messages = () => {
  const currentUserId = localStorage.getItem("userId");

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit("join", currentUserId);

    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receive-message");
  }, []);

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