import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { connectSocket } from "../socket";
import { fetchWithToken, API_BASE } from "../api/api";

import VideoCall from "../components/VideoCall";
import VoiceRecorder from "../components/VoiceRecorder";
import VoiceCall from "../components/VoiceCall";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

const Messages = () => {
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const currentUser = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const { id } = useParams();

  const [friends, setFriends] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);

  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [showCall, setShowCall] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // SOCKET
  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    if (!socket || !currentUser) return;

    socket.emit("join", currentUser);

    const handleReceiveMessage = (message) => {
      if (!selectedUser) return;

      const isRelevant =
        message.sender === selectedUser._id ||
        message.receiver === selectedUser._id ||
        message.sender?._id === selectedUser._id;

      if (!isRelevant) return;

      setMessages((prev) => {
        const exists = prev.some(
          (m) => String(m._id) === String(message._id)
        );
        return exists ? prev : [...prev, message];
      });
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [currentUser, selectedUser?._id]);

  // LOAD MESSAGES
  const loadMessages = async (userId) => {
    try {
      setMessages([]);

      const data = await fetchWithToken(
        `${API_BASE}/api/messages/${userId}`,
        token
      );

      setMessages(data || []);
      setShowSidebar(false);
    } catch (err) {
      console.log(err);
    }
  };

  // FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await fetchWithToken(
          `${API_BASE}/api/users`,
          token
        );

        setFriends(data || []);

        if (id) {
          let foundUser = data.find((u) => u._id === id);

          if (!foundUser) {
            foundUser = await fetchWithToken(
              `${API_BASE}/api/users/${id}`,
              token
            );
          }

          if (foundUser) {
            setSelectedUser(foundUser);
            loadMessages(foundUser._id);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, [id]);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!text.trim() && !media) return;

    try {
      let uploadedMedia = "";
      let mediaType = "";

      // upload media
      if (media) {
        setUploading(true);

        const formData = new FormData();
        formData.append("file", media);
        formData.append("upload_preset", "YOUR_UPLOAD_PRESET");

        const cloudName = "YOUR_CLOUD_NAME";

        const resourceType = media.type.startsWith("video")
          ? "video"
          : media.type.startsWith("image")
          ? "image"
          : "auto";

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadData = await uploadRes.json();

        uploadedMedia = uploadData.secure_url;

        mediaType = media.type.startsWith("video")
          ? "video"
          : media.type.startsWith("audio")
          ? "audio"
          : "image";
      }

      const res = await fetchWithToken(
        `${API_BASE}/api/messages`,
        token,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            receiver: selectedUser._id,
            text,
            media: uploadedMedia,
            mediaType,
          }),
        }
      );

      const messageData =
        res?.data?.message || res?.data || res;

      // add to UI immediately
      setMessages((prev) => [...prev, messageData]);

      // send socket
      socketRef.current?.emit("send-message", {
        ...messageData,
        sender: currentUser,
        receiver: selectedUser._id,
      });

      setText("");
      setMedia(null);
    } catch (err) {
      console.log(err);
    } finally {
      setUploading(false);
    }
  };

  // UI
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Sidebar */}
      <div className="w-[320px] bg-white border-r overflow-y-auto">
        <div className="p-4 font-bold text-blue-600">Messages</div>

        {friends.map((user) => (
          <div
            key={user._id}
            onClick={() => {
              setSelectedUser(user);
              loadMessages(user._id);
            }}
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100"
          >
            <img
              src={user.profilePic || defaultProfile}
              className="w-12 h-12 rounded-full"
              alt=""
            />
            <div>
              <div className="font-semibold">{user.name}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col">

        {selectedUser ? (
          <>
            <div className="p-4 border-b font-bold">
              {selectedUser.name}
            </div>

            {/* messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMe =
                  String(msg.sender?._id || msg.sender) ===
                  String(currentUser);

                return (
                  <div
                    key={msg._id}
                    className={`flex ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="max-w-[70%] p-3 rounded-xl bg-white shadow">
                      {msg.text && <p>{msg.text}</p>}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* input */}
            <div className="p-3 border-t flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 border rounded px-3"
                placeholder="Type message..."
              />

              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 rounded"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;