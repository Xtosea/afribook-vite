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

    return () => {
      socket.off("receive-message");
    };
  }, [selectedUser, currentUser]);

  // FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
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

    fetchUsers();
  }, []);

  // LOAD MESSAGES
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

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!text.trim() && !media) return;

    try {
      let uploadedMedia = "";
      let mediaType = "";

      // UPLOAD MEDIA
      if (media) {
        setUploading(true);

        const formData = new FormData();

        formData.append("file", media);

        formData.append(
          "upload_preset",
          "YOUR_UPLOAD_PRESET"
        );

        const cloudName = "YOUR_CLOUD_NAME";

        const resourceType =
          media.type.startsWith("video")
            ? "video"
            : media.type.startsWith("image")
            ? "image"
            : "video";

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadData =
          await uploadRes.json();

        uploadedMedia = uploadData.secure_url;

        mediaType =
          resourceType === "video"
            ? "video"
            : "image";
      }

      // SAVE MESSAGE
      const res = await fetchWithToken(
        `${API_BASE}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            receiver: selectedUser._id,
            text,
            media: uploadedMedia,
            mediaType,
          }),
        }
      );

      const newMessage = await res.json();

      setMessages((prev) => [
        ...prev,
        newMessage,
      ]);

      socketRef.current.emit(
        "send-message",
        newMessage
      );

      setText("");
      setMedia(null);

      setUploading(false);
    } catch (err) {
      console.log(err);
      setUploading(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* SIDEBAR */}
<div
  className={`
    w-full md:w-[320px] lg:w-[350px]
    bg-white border-r
    flex flex-col
    shrink-0
    h-full
    overflow-hidden
  `}
>
  {/* HEADER */}
  <div className="p-4 border-b bg-white sticky top-0 z-10">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-blue-600">
        Messages
      </h1>

      <button className="bg-blue-100 text-blue-600 px-3 py-2 rounded-full text-sm font-medium hover:bg-blue-200 transition">
        ✨
      </button>
    </div>

    {/* SEARCH */}
    <div className="mt-4">
      <input
        type="text"
        placeholder="Search friends..."
        className="w-full bg-gray-100 border border-gray-200 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>

  {/* USERS */}
  <div className="flex-1 overflow-y-auto">
    {friends.map((user) => (
      <div
        key={user._id}
        onClick={() => {
          setSelectedUser(user);
          loadMessages(user._id);
        }}
        className={`
          flex items-center gap-3
          px-4 py-4
          cursor-pointer
          transition-all duration-200
          border-b border-gray-100
          hover:bg-gray-50
          ${
            selectedUser?._id === user._id
              ? "bg-blue-50"
              : ""
          }
        `}
      >
        {/* PROFILE */}
        <div className="relative shrink-0">
          <img
            src={
              user.profilePic ||
              defaultProfile
            }
            alt=""
            className="w-14 h-14 rounded-full object-cover border"
          />

          {/* ONLINE DOT */}
          <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        </div>

        {/* USER INFO */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold truncate text-gray-800">
              {user.name}
            </h2>

            <span className="text-xs text-gray-400">
              2m
            </span>
          </div>

          <p className="text-sm text-gray-500 truncate">
            Tap to chat
          </p>
        </div>
      </div>
    ))}
  </div>
</div>

      
      {/* CHAT AREA */}
<div className="flex-1 flex flex-col w-full min-w-0">
        {selectedUser ? (
          <>
            {/* TOP BAR */}
            <div className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
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

              {/* VIDEO CALL BUTTON */}
              <button
                onClick={() =>
                  setShowCall(true)
                }
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full"
              >
                📹
              </button>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
              {messages.map((msg, index) => {
                const isMe =
                  msg.sender === currentUser ||
                  msg.sender?._id ===
                    currentUser;

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
                      {/* IMAGE */}
                      {msg.mediaType ===
                        "image" && (
                        <img
                          src={msg.media}
                          alt=""
                          className="rounded-xl mb-2 max-w-full"
                        />
                      )}

                      {/* VIDEO */}
                      {msg.mediaType ===
                        "video" && (
                        <video
                          controls
                          className="rounded-xl mb-2 max-w-full"
                        >
                          <source
                            src={msg.media}
                          />
                        </video>
                      )}

                      {/* AUDIO */}
                      {msg.mediaType ===
                        "audio" && (
                        <audio
                          controls
                          className="mt-2"
                        >
                          <source
                            src={msg.media}
                          />
                        </audio>
                      )}

                      {/* TEXT */}
                      {msg.text && (
                        <p>{msg.text}</p>
                      )}

                      {/* TIME */}
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

            {/* INPUT AREA */}
            <div className="bg-white border-t p-4 flex items-center gap-3">
              {/* FILE PICKER */}
              <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 px-4 py-3 rounded-full transition">
                📎

                <input
                  type="file"
                  accept="image/*,video/*"
                  hidden
                  onChange={(e) =>
                    setMedia(
                      e.target.files[0]
                    )
                  }
                />
              </label>

              {/* TEXT INPUT */}
              <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) =>
                  setText(e.target.value)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  sendMessage()
                }
                className="flex-1 border rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* VOICE NOTE */}
              <VoiceRecorder
                onSend={async (audioUrl) => {
                  const res =
                    await fetchWithToken(
                      `${API_BASE}/messages`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type":
                            "application/json",
                        },
                        body: JSON.stringify({
                          receiver:
                            selectedUser._id,
                          media: audioUrl,
                          mediaType:
                            "audio",
                        }),
                      }
                    );

                  const newMessage =
                    await res.json();

                  setMessages((prev) => [
                    ...prev,
                    newMessage,
                  ]);

                  socketRef.current.emit(
                    "send-message",
                    newMessage
                  );
                }}
              />

              {/* SEND BUTTON */}
              <button
                onClick={sendMessage}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition"
              >
                {uploading
                  ? "Uploading..."
                  : "Send"}
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
                Select a user to start
                chatting
              </p>
            </div>
          </div>
        )}
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