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

    try {
      let uploadedMedia = "";
      let mediaType = "";

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
    <div className="h-screen w-full flex bg-gray-100 overflow-hidden">

      {/* LEFT SIDE USERS */}
      <div className="w-[300px] bg-white border-r flex flex-col shrink-0">

        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">
            Messages
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {friends.map((user) => (
            <div
              key={user._id}
              onClick={() => loadMessages(user)}
              className={`flex items-center gap-3 px-4 py-4 cursor-pointer border-b hover:bg-gray-50 ${
                selectedUser?._id === user._id
                  ? "bg-blue-50"
                  : ""
              }`}
            >
              <img
                src={user.profilePic || defaultProfile}
                className="w-12 h-12 rounded-full object-cover shrink-0"
              />

              <div className="min-w-0">
                <h2 className="font-semibold truncate">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-500 truncate">
                  Tap to chat
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* TOP BAR */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0 min-w-0">

          {selectedUser ? (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={
                    selectedUser.profilePic ||
                    defaultProfile
                  }
                  className="w-10 h-10 rounded-full shrink-0"
                />

                <div className="min-w-0">
                  <h2 className="font-bold truncate">
                    {selectedUser.name}
                  </h2>
                  <p className="text-xs text-green-500">
                    Online
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
            <h2 className="font-semibold text-gray-500">
              Select a user
            </h2>
          )}
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-4 py-6 min-w-0">
          <div className="max-w-4xl mx-auto space-y-4 min-w-0">

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
                    className={`px-4 py-3 rounded-2xl max-w-[75%] break-words ${
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

        {/* INPUT */}
        <div className="bg-white border-t p-3 flex gap-2 shrink-0 min-w-0">

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type message..."
            className="flex-1 border rounded-full px-4 py-2 outline-none"
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
            className="bg-blue-600 text-white px-5 py-2 rounded-full"
          >
            Send
          </button>
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