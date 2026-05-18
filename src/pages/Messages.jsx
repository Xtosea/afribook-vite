import React, { useState } from "react";

const Messages = () => {
  const [messages, setMessages] = useState([
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