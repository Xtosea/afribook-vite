import React, { useEffect, useState, useRef } from "react";
import { connectSocket } from "../socket";
import { fetchWithToken, API_BASE } from "../api/api";

import VideoCall from "../components/VideoCall";
import VoiceRecorder from "../components/VoiceRecorder";

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
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showCall, setShowCall] = useState(false);

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // SOCKET
  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    if (!socket) return;

    socket.emit("join", currentUser);

    socket.on("receive-message", (message) => {
      if (
        selectedUser &&
        (message.sender === selectedUser._id ||
          message.receiver === selectedUser._id ||
          message.sender?._id === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socket.off("receive-message");
  }, [selectedUser, currentUser]);

  // USERS
  useEffect(() => {
    const loadUsers = async () => {
      const res = await fetchWithToken(`${API_BASE}/users`);
      const data = await res.json();
      setFriends(data);
    };

    loadUsers();
  }, []);

  // LOAD MESSAGES
  const loadMessages = async (user) => {
    setSelectedUser(user);

    const res = await fetchWithToken(
      `${API_BASE}/messages/${user._id}`
    );

    const data = await res.json();
    setMessages(data);
  };

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!text.trim() && !media) return;

    let uploadedMedia = "";
    let mediaType = "";

    try {
      if (media) {
        setUploading(true);

        const formData = new FormData();
        formData.append("file", media);
        formData.append("upload_preset", "YOUR_UPLOAD_PRESET");

        const cloudName = "YOUR_CLOUD_NAME";

        const type = media.type.startsWith("video")
          ? "video"
          : "image";

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();

        uploadedMedia = data.secure_url;
        mediaType = type;
      }

      const res = await fetchWithToken(`${API_BASE}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver: selectedUser._id,
          text,
          media: uploadedMedia,
          mediaType,
        }),
      });

      const newMessage = await res.json();

      setMessages((prev) => [...prev, newMessage]);
      socketRef.current.emit("send-message", newMessage);

      setText("");
      setMedia(null);
      setUploading(false);
    } catch (err) {
      console.log(err);
      setUploading(false);
    }
  };

  return (
    return (
  <div className="fixed inset-0 bg-gray-100 overflow-hidden flex">

      {/* GRID LAYOUT (THIS FIXES EVERYTHING) */}
      <div className="h-full grid grid-cols-[320px_1fr]">

        {/* LEFT USERS PANEL */}
        <div className="bg-white border-r overflow-hidden flex flex-col">

          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-blue-600">
              Messages
            </h1>
          </div>

          <div className="overflow-y-auto flex-1">
            {friends.map((user) => (
              <div
                key={user._id}
                onClick={() => loadMessages(user)}
                className={`flex items-center gap-3 p-4 cursor-pointer border-b hover:bg-gray-50 ${
                  selectedUser?._id === user._id
                    ? "bg-blue-50"
                    : ""
                }`}
              >
                <img
                  src={user.profilePic || defaultProfile}
                  className="w-12 h-12 rounded-full"
                />

                <div className="min-w-0">
                  <h2 className="font-semibold truncate">
                    {user.name}
                  </h2>
                  <p className="text-xs text-gray-500 truncate">
                    Tap to chat
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CHAT PANEL */}
        <div className="flex flex-col overflow-hidden">

          {/* TOP BAR */}
          <div className="bg-white border-b p-4 flex justify-between items-center">

            {selectedUser ? (
              <>
                <div className="flex items-center gap-3">
                  <img
                    src={
                      selectedUser.profilePic ||
                      defaultProfile
                    }
                    className="w-10 h-10 rounded-full"
                  />

                  <div>
                    <h2 className="font-bold">
                      {selectedUser.name}
                    </h2>
                    <p className="text-xs text-green-500">
                      online
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCall(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-full"
                >
                  📹
                </button>
              </>
            ) : (
              <h2 className="text-gray-500 font-medium">
                Select a user to start chatting
              </h2>
            )}
          </div>

          {/* MESSAGES AREA */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
            <div className="max-w-4xl mx-auto space-y-3">

              {messages.map((msg, i) => {
                const isMe =
                  msg.sender === currentUser ||
                  msg.sender?._id === currentUser;

                return (
                  <div
                    key={i}
                    className={`flex ${
                      isMe
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-[70%] break-words ${
                        isMe
                          ? "bg-blue-600 text-white"
                          : "bg-white"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* INPUT AREA */}
          <div className="bg-white border-t p-3 flex gap-2 items-center">

            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type message..."
              className="flex-1 border rounded-full px-4 py-2"
            />

            <VoiceRecorder
              onSend={async (audioUrl) => {
                const res = await fetchWithToken(
                  `${API_BASE}/messages`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      receiver: selectedUser._id,
                      media: audioUrl,
                      mediaType: "audio",
                    }),
                  }
                );

                const newMessage = await res.json();
                setMessages((prev) => [...prev, newMessage]);
                socketRef.current.emit("send-message", newMessage);
              }}
            />

            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-full"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* VIDEO CALL */}
      {showCall && (
        <VideoCall
          currentUser={currentUser}
          selectedUser={selectedUser}
        />
      )}
    </div>
  );
};

export default Messages;