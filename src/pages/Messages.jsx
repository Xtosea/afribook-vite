import React, { useEffect, useState, useRef } from "react";
import { connectSocket } from "../socket";
import { fetchWithToken, API_BASE } from "../api/api";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

const Messages = () => {
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const currentUser = localStorage.getItem("userId");

  const [friends, setFriends] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // socket setup
  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    if (!socket) return;

    socket.emit("join", currentUser);

    socket.on("receive-message", (message) => {
      if (
        selectedUser &&
        (message.sender === selectedUser._id ||
          message.receiver === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, [selectedUser, currentUser]);

  // fetch friends/users
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetchWithToken(
          `${API_BASE}/users`
        );

        const data = await res.json();

        setFriends(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchFriends();
  }, []);

  // fetch messages
  const loadMessages = async (userId) => {
    try {
      const res = await fetchWithToken(
        `${API_BASE}/messages/${userId}`
      );

      const data = await res.json();

      setMessages(data);
    } catch (err) {
      console.log(err);
    }
  };

  // send message
  const sendMessage = async () => {
    if (!text.trim() || !selectedUser) return;

    try {
      const res = await fetchWithToken(
        `${API_BASE}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiver: selectedUser._id,
            text,
          }),
        }
      );

      const newMessage = await res.json();

      setMessages((prev) => [...prev, newMessage]);

      socketRef.current.emit("send-message", newMessage);

      setText("");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-[320px] bg-white border-r flex flex-col">
        {/* header */}
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold text-blue-600">
            Messages
          </h1>
        </div>

        {/* users */}
        <div className="flex-1 overflow-y-auto">
          {friends.map((user) => (
            <div
              key={user._id}
              onClick={() => {
                setSelectedUser(user);
                loadMessages(user._id);
              }}
              className={`flex items-center gap-3 p-4 cursor-pointer transition hover:bg-gray-100 ${
                selectedUser?._id === user._id
                  ? "bg-blue-50"
                  : ""
              }`}
            >
              <img
                src={user.profilePic || defaultProfile}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />

              <div>
                <h2 className="font-semibold">
                  {user.name}
                </h2>

                <p className="text-sm text-gray-500">
                  Tap to chat
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* top bar */}
            <div className="bg-white border-b p-4 flex items-center gap-3 shadow-sm">
              <img
                src={
                  selectedUser.profilePic ||
                  defaultProfile
                }
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />

              <div>
                <h2 className="font-bold text-lg">
                  {selectedUser.name}
                </h2>

                <p className="text-sm text-green-500">
                  Online
                </p>
              </div>
            </div>

            {/* messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
              {messages.map((msg, index) => {
                const isMe =
                  msg.sender === currentUser ||
                  msg.sender?._id === currentUser;

                return (
                  <div
                    key={index}
                    className={`flex ${
                      isMe
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-white text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      <p>{msg.text}</p>

                      <p
                        className={`text-[11px] mt-1 ${
                          isMe
                            ? "text-blue-100"
                            : "text-gray-400"
                        }`}
                      >
                        {new Date(
                          msg.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef}></div>
            </div>

            {/* input */}
            <div className="bg-white border-t p-4 flex items-center gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) =>
                  setText(e.target.value)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && sendMessage()
                }
                className="flex-1 border rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-700">
                Welcome to Messages
              </h2>

              <p className="text-gray-500 mt-2">
                Select a user to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;