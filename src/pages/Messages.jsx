import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
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
  const token = localStorage.getItem("token");

  const [friends, setFriends] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [showCall, setShowCall] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  // FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await fetchWithToken(`${API_BASE}/api/users`, token);
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
      const data = await fetchWithToken(
        `${API_BASE}/api/messages/${userId}`,
        token
      );
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

      if (media) {
        setUploading(true);

        const formData = new FormData();
        formData.append("file", media);

        const cloudName = "YOUR_CLOUD_NAME";
        const resourceType = media.type.startsWith("video")
          ? "video"
          : "image";

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
          { method: "POST", body: formData }
        );

        const uploadData = await uploadRes.json();
        uploadedMedia = uploadData.secure_url;
        mediaType = resourceType;
      }

      const newMessage = await fetchWithToken(
        `${API_BASE}/api/messages`,
        token,
        {
          method: "POST",
          body: JSON.stringify({
            receiver: selectedUser._id,
            text,
            media: uploadedMedia,
            mediaType,
          }),
        }
      );

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
    <div className="h-screen flex bg-gradient-to-b from-gray-100 to-gray-200 overflow-hidden relative">

      {/* SIDEBAR */}
      <div
        className={`fixed md:relative z-40 top-0 left-0 h-full w-[320px] bg-white border-r flex flex-col transition-transform duration-300 ${
          showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {friends.map((user) => (
            <div
              key={user._id}
              onClick={() => {
                setSelectedUser(user);
                loadMessages(user._id);
              }}
              className="flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-gray-100"
            >
              <img
                src={user.profilePic || defaultProfile}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-semibold">{user.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col">

        {selectedUser ? (
          <>
            {/* HEADER (STICKY FIXED PROPERLY) */}
            <div className="sticky top-0 z-30 bg-white border-b p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.profilePic || defaultProfile}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-bold">{selectedUser.name}</p>
                  <p className="text-xs text-green-500">Online</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowVoiceCall(true)}
                  className="w-10 h-10 bg-blue-500 text-white rounded-full"
                >
                  📞
                </button>

                <button
                  onClick={() => setShowCall(true)}
                  className="w-10 h-10 bg-green-500 text-white rounded-full"
                >
                  📹
                </button>
              </div>
            </div>

            {/* MESSAGES SCROLL AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className="break-words">
                  {msg.text}
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>

            {/* INPUT */}
            <div className="border-t p-2 bg-white flex gap-2 items-center">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 border rounded-full px-3 py-2"
                placeholder="Type..."
              />

              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded-full"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            Select a user
          </div>
        )}
      </div>

      {/* CALL MODALS */}
      {showCall && <VideoCall onClose={() => setShowCall(false)} />}
      {showVoiceCall && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center text-white">
          Voice Call
        </div>
      )}
    </div>
  );
};

export default Messages;