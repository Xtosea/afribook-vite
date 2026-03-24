import React, { useState, useEffect, useRef } from "react";
import { getSocket } from "../../socket";

const ChatWindow = ({ selectedUser, messages = [] }) => {
  const currentUserId = localStorage.getItem("userId");
  const [text, setText] = useState("");
  const [localMessages, setLocalMessages] = useState(messages);

  const bottomRef = useRef(null);

  // Sync incoming props to local state
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Listen for real-time messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleMessage = (msg) => {
      setLocalMessages((prev) => [...prev, msg]);
    };

    socket.on("receive-message", handleMessage);

    return () => {
      socket.off("receive-message", handleMessage);
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Select a chat
      </div>
    );
  }

  const safeSelectedId = selectedUser?._id;

  const sendMessage = () => {
    const socket = getSocket();

    if (!socket) {
      console.log("❌ Socket not connected yet");
      return;
    }

    if (!text.trim() || !safeSelectedId) return;

    const newMessage = {
      senderId: currentUserId,
      receiverId: safeSelectedId,
      text,
    };

    // Emit to server
    socket.emit("send-message", newMessage);

    // Optimistic UI (instant display)
    setLocalMessages((prev) => [...prev, newMessage]);

    setText("");
  };

  const filteredMessages = localMessages.filter(
    (m) =>
      (m.senderId === currentUserId && m.receiverId === safeSelectedId) ||
      (m.senderId === safeSelectedId && m.receiverId === currentUserId)
  );

  return (
    <div className="flex-1 flex flex-col">
      
      {/* HEADER */}
      <div className="p-4 border-b bg-white font-bold">
        {selectedUser.name || "Chat"}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredMessages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-xs px-3 py-2 rounded ${
              msg.senderId === currentUserId
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-300"
            }`}
          >
            {msg.text || ""}
          </div>
        ))}

        {/* Auto scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 border-t flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;