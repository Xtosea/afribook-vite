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

  const [showSidebar, setShowSidebar] = useState(false);

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

      setShowSidebar(false);
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
    return (
  <div className="h-screen bg-gray-100 overflow-hidden">
    <div className="h-full grid grid-cols-1 md:grid-cols-[320px_1fr]">

      {/* SIDEBAR */}
      <div className="bg-white border-r h-full flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="p-4 border-b bg-white shrink-0">
          <h1 className="text-2xl font-bold text-blue-600">
            Messages
          </h1>

          {/* SEARCH */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search users..."
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
              className={`flex items-center gap-3 px-4 py-4 cursor-pointer border-b hover:bg-gray-50 transition ${
                selectedUser?._id === user._id
                  ? "bg-blue-50"
                  : ""
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={
                    user.profilePic ||
                    defaultProfile
                  }
                  alt=""
                  className="w-14 h-14 rounded-full object-cover"
                />

                <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="font-semibold truncate text-gray-800">
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


      {/* CHAT AREA */}
      <div className="flex flex-col h-full min-w-0 overflow-hidden">
        {selectedUser ? (
          <>
            {/* TOP BAR */}
            <div className="bg-white border-b px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={
                    selectedUser.profilePic ||
                    defaultProfile
                  }
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div className="min-w-0">
                  <h2 className="font-bold text-lg truncate">
                    {selectedUser.name}
                  </h2>

                  <p className="text-sm text-green-500">
                    Online
                  </p>
                </div>
              </div>

              {/* VIDEO CALL */}
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
            <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-100">
              <div className="max-w-4xl mx-auto space-y-4">
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
                        className={`max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-3xl shadow-sm break-words ${
                          isMe
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-white text-gray-800 rounded-bl-md"
                        }`}
                      >
                        {/* IMAGE */}
                        {msg.mediaType ===
                          "image" && (
                          <img
                            src={msg.media}
                            alt=""
                            className="rounded-2xl mb-2 max-w-full"
                          />
                        )}

                        {/* VIDEO */}
                        {msg.mediaType ===
                          "video" && (
                          <video
                            controls
                            className="rounded-2xl mb-2 max-w-full"
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
                            className="mt-2 w-full"
                          >
                            <source
                              src={msg.media}
                            />
                          </audio>
                        )}

                        {/* TEXT */}
                        {msg.text && (
                          <p>
                            {msg.text}
                          </p>
                        )}

                        {/* TIME */}
                        <p
                          className={`text-[11px] mt-2 ${
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
            </div>


            {/* INPUT AREA */}
            <div className="bg-white border-t p-4 shrink-0">
              <div className="max-w-4xl mx-auto flex items-center gap-3">

                {/* FILE PICKER */}
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-full transition">
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

                {/* INPUT */}
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
                  className="flex-1 bg-gray-100 border border-gray-200 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* VOICE */}
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

                {/* SEND */}
                <button
                  onClick={sendMessage}
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold"
                >
                  {uploading
                    ? "Uploading..."
                    : "Send"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center px-5">
              <h2 className="text-3xl font-bold text-gray-700">
                Welcome to Messages
              </h2>

              <p className="text-gray-500 mt-3">
                Select a user to start chatting
              </p>
            </div>
          </div>
        )}
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