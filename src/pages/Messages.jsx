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
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
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
    const fetchUsers = async () => {
      const res = await fetchWithToken(`${API_BASE}/users`);
      const data = await res.json();
      setFriends(data);
    };

    fetchUsers();
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

        const resourceType =
          media.type.startsWith("video")
            ? "video"
            : "image";

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadData = await uploadRes.json();
        uploadedMedia = uploadData.secure_url;
        mediaType = resourceType;
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
    <div className="h-screen flex flex-col bg-gray-100">

      {/* TOP USER SCROLL BAR (NO SIDEBAR) */}
      <div className="bg-white border-b p-3 overflow-x-auto flex gap-3">
        {friends.map((user) => (
          <div
            key={user._id}
            onClick={() => loadMessages(user)}
            className={`flex flex-col items-center min-w-[70px] cursor-pointer ${
              selectedUser?._id === user._id
                ? "opacity-100"
                : "opacity-70"
            }`}
          >
            <img
              src={user.profilePic || defaultProfile}
              className="w-12 h-12 rounded-full object-cover border"
            />
            <p className="text-xs truncate w-[60px] text-center">
              {user.name}
            </p>
          </div>
        ))}
      </div>

      {/* CHAT HEADER */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b">
        {selectedUser ? (
          <>
            <div className="flex items-center gap-3">
              <img
                src={
                  selectedUser.profilePic || defaultProfile
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
          <h2 className="font-bold text-gray-600">
            Select a user to start chatting
          </h2>
        )}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => {
          const isMe = msg.sender === currentUser;

          return (
            <div
              key={i}
              className={`flex ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[75%] ${
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

      {/* INPUT */}
      <div className="bg-white p-3 flex items-center gap-2 border-t">
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
                headers: { "Content-Type": "application/json" },
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