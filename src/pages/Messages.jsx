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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetchWithToken(`${API_BASE}/users`);
      const data = await res.json();
      setFriends(data);
    };

    fetchUsers();
  }, []);

  const loadMessages = async (userId) => {
    const res = await fetchWithToken(
      `${API_BASE}/messages/${userId}`
    );
    const data = await res.json();
    setMessages(data);
    setShowSidebar(false);
  };

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
            : media.type.startsWith("image")
            ? "image"
            : "video";

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
          { method: "POST", body: formData }
        );

        const uploadData = await uploadRes.json();
        uploadedMedia = uploadData.secure_url;

        mediaType = resourceType === "video" ? "video" : "image";
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
    <div className="h-screen bg-gray-100 flex overflow-hidden">

      {/* MOBILE OVERLAY */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* SIDEBAR (DESKTOP ONLY) */}
      <div className="hidden md:flex w-[320px] bg-white border-r flex-col">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold text-blue-600">
            Messages
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {friends.map((user) => (
            <div
              key={user._id}
              onClick={() => {
                setSelectedUser(user);
                loadMessages(user._id);
              }}
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

      {/* MOBILE SIDEBAR DRAWER */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-[300px] bg-white h-full flex flex-col shadow-2xl">
            <div className="p-4 border-b flex justify-between">
              <h1 className="text-xl font-bold text-blue-600">
                Messages
              </h1>

              <button
                onClick={() => setShowSidebar(false)}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {friends.map((user) => (
                <div
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user);
                    loadMessages(user._id);
                    setShowSidebar(false);
                  }}
                  className="flex items-center gap-3 p-4 border-b hover:bg-gray-50"
                >
                  <img
                    src={user.profilePic || defaultProfile}
                    className="w-12 h-12 rounded-full"
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

          <div
            className="flex-1"
            onClick={() => setShowSidebar(false)}
          />
        </div>
      )}

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col">

        {/* TOP BAR */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-2xl"
              onClick={() => setShowSidebar(true)}
            >
              ☰
            </button>

            {selectedUser && (
              <>
                <img
                  src={
                    selectedUser.profilePic ||
                    defaultProfile
                  }
                  className="w-10 h-10 rounded-full"
                />
                <h2 className="font-bold">
                  {selectedUser.name}
                </h2>
              </>
            )}
          </div>

          <button
            onClick={() => setShowCall(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-full"
          >
            📹
          </button>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === currentUser
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div className="bg-white px-4 py-2 rounded-xl max-w-[75%]">
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="p-3 bg-white flex gap-2">
          <input
            className="flex-1 border rounded-full px-4"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 rounded-full"
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