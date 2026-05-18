import React, { useState } from "react";

const Message = () => {
  const [messages, setMessages] = import React, { useEffect, useState } from "react";
import { connectSocket, safeEmit } from "../socket";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState([]);

  useEffect(() => {
    const socket = connectSocket();

    if (!socket) return;

    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive-message", handleMessage);

    return () => {
      socket.off("receive-message", handleMessage);
    };
  }, []);

  const sendMessage = () => {
  const socket = connectSocket();

  if (!socket || !socket.connected) {
    console.log("❌ Socket unavailable");
    return;
  }

  safeEmit("send-message", {
    text,
    receiver: "USER_ID",
  });

  setText("");
};

  return (
    <div className="max-w-xl mx-auto">
      <div className="h-96 overflow-y-auto border">
        {messages.map((m, i) => (
          <div key={i} className="p-2">
            {m.text}
          </div>
        ))}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="border w-full p-2"
      />

      <button onClick={sendMessage}>
        Send
      </button>
    </div>
  );
};

export default Messages;([
    { text: "Hello 👋", sender: "me" },
    { text: "Hi there!", sender: "other" },
  ]);

  const [text, setText] = useState("");

  const sendMessage = () => {
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      { text, sender: "me" },
    ]);

    setText("");
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        background: "#f3f4f6",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "15px",
          background: "white",
          borderBottom: "1px solid #ddd",
          fontWeight: "bold",
        }}
      >
        Messag
      </div>

      {/* MESSAGES */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "15px",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent:
                msg.sender === "me"
                  ? "flex-end"
                  : "flex-start",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                padding: "10px 15px",
                borderRadius: "20px",
                background:
                  msg.sender === "me"
                    ? "#2563eb"
                    : "white",
                color:
                  msg.sender === "me"
                    ? "white"
                    : "black",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div
        style={{
          display: "flex",
          padding: "10px",
          background: "white",
          borderTop: "1px solid #ddd",
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            outline: "none",
          }}
          placeholder="Type message..."
        />

        <button
          onClick={sendMessage}
          style={{
            marginLeft: "10px",
            padding: "10px 15px",
            borderRadius: "20px",
            background: "#2563eb",
            color: "white",
            border: "none",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Messages;