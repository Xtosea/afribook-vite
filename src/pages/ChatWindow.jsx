import React, { useState } from "react";
import { socket } from "../../socket";

const ChatWindow = ({ selectedUser, messages }) => {
  const currentUserId = localStorage.getItem("userId");
  const [text, setText] = useState("");

  if (!selectedUser) {
    return <div className="flex-1 flex items-center justify-center">Select a chat</div>;
  }

  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("send-message", {
      senderId: currentUserId,
      receiverId: selectedUser._id,
      text,
    });

    setText("");
  };

  return (
    <div className="flex-1 flex flex-col">

      {/* HEADER */}
      <div className="p-4 border-b bg-white font-bold">
        {selectedUser.name}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages
          .filter(
            (m) =>
              (m.senderId === currentUserId && m.receiverId === selectedUser._id) ||
              (m.senderId === selectedUser._id && m.receiverId === currentUserId)
          )
          .map((msg, i) => (
            <div
              key={i}
              className={`max-w-xs px-3 py-2 rounded ${
                msg.senderId === currentUserId
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-300"
              }`}
            >
              {msg.text}
            </div>
          ))}
      </div>

      {/* INPUT */}
      <div className="p-3 border-t flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
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