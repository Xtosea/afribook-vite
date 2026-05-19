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

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SOCKET ================= */
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

    return () => socket.off("receive-message");
  }, [selectedUser]);

  /* ================= USERS ================= */
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

  /* ================= LOAD MESSAGES ================= */
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

  /* ================= SEND ================= */
  const sendMessage = async () => {
    if (!text.trim() && !media) return;

    try {
      let uploadedMedia = "";
      let mediaType = "";

      if (media) {
        setUploading(true);

        const formData = new FormData();
        formData.append("file", media);

        const uploadRes = await fetch(
          "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/video/upload",
          { method: "POST", body: formData }
        );

        const uploadData = await uploadRes.json();
        uploadedMedia = uploadData.secure_url;

        mediaType = media.type.startsWith("video")
          ? "video"
          : "image";
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
    <div className="h-screen flex bg-gray-100 overflow-hidden">

      {/* SIDEBAR */}
      <div
        className={`fixed md:relative w-[300px] bg-white border-r h-full z-40 transition-transform ${
          showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 font-bold text-blue-600 border-b">
          Messages
        </div>

        {friends.map((user) => (
          <div
            key={user._id}
            onClick={() => {
              setSelectedUser(user);
              loadMessages(user._id);
            }}
            className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
          >
            <img
              src={user.profilePic || defaultProfile}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-gray-500">Tap to chat</p>
            </div>
          </div>
        ))}
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* 🔥 TOP BAR (FIXED STICKY) */}
        {selectedUser && (
          <div className="shrink-0 sticky top-0 z-30 bg-white border-b px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden text-2xl"
              >
                ☰
              </button>

              <img
                src={selectedUser.profilePic || defaultProfile}
                className="w-10 h-10 rounded-full"
              />

              <div>
                <p className="font-semibold">
                  {selectedUser.name}
                </p>
                <p className="text-xs text-green-500">Online</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowVoiceCall(true)}
                className="w-9 h-9 bg-blue-500 text-white rounded-full"
              >
                📞
              </button>

              <button
                onClick={() => setShowCall(true)}
                className="w-9 h-9 bg-green-500 text-white rounded-full"
              >
                📹
              </button>
            </div>
          </div>
        )}

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
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
                      : "bg-white shadow"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT (FIXED + CLEAN) */}
        <div className="border-t bg-white p-2 flex items-center gap-2">

          <label className="text-xl">📎
            <input
              type="file"
              hidden
              onChange={(e) => setMedia(e.target.files[0])}
            />
          </label>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type message..."
            className="flex-1 bg-gray-100 px-3 py-2 rounded-full outline-none"
          />

          <VoiceRecorder
            onSend={async (audioUrl) => {
              await fetchWithToken(`${API_BASE}/api/messages`, token, {
                method: "POST",
                body: JSON.stringify({
                  receiver: selectedUser._id,
                  media: audioUrl,
                  mediaType: "audio",
                }),
              });
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

      {/* CALL MODALS */}
      {showCall && (
        <VideoCall
          currentUser={currentUser}
          selectedUser={selectedUser}
          onClose={() => setShowCall(false)}
        />
      )}
    </div>
  );
};

export default Messages;