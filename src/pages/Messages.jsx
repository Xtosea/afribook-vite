import React, {
  useEffect,
  useState,
  useRef,
} from "react";

import { motion } from "framer-motion";

import { connectSocket } from "../socket";

import {
  fetchWithToken,
  API_BASE,
} from "../api/api";

import VideoCall from "../components/VideoCall";
import VoiceRecorder from "../components/VoiceRecorder";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

const Messages = () => {
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const currentUser =
    localStorage.getItem("userId");

  const token =
    localStorage.getItem("token");

  const [friends, setFriends] =
    useState([]);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [text, setText] =
    useState("");

  const [media, setMedia] =
    useState(null);

  const [uploading, setUploading] =
    useState(false);

  const [showCall, setShowCall] =
    useState(false);

  const [
    showVoiceCall,
    setShowVoiceCall,
  ] = useState(false);

  const [showSidebar, setShowSidebar] =
    useState(false);

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

    socket.on(
      "receive-message",
      (message) => {
        if (
          selectedUser &&
          (message.sender ===
            selectedUser._id ||
            message.receiver ===
              selectedUser._id ||
            message.sender?._id ===
              selectedUser._id)
        ) {
          setMessages((prev) => [
            ...prev,
            message,
          ]);
        }
      }
    );

    return () => {
      socket.off("receive-message");
    };
  }, [selectedUser, currentUser]);

  // FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data =
          await fetchWithToken(
            `${API_BASE}/api/users`,
            token
          );

        setFriends(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, []);

  // LOAD MESSAGES
  const loadMessages = async (
    userId
  ) => {
    try {
      const data =
        await fetchWithToken(
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
    if (!text.trim() && !media)
      return;

    try {
      let uploadedMedia = "";
      let mediaType = "";

      // MEDIA UPLOAD
      if (media) {
        setUploading(true);

        const formData =
          new FormData();

        formData.append(
          "file",
          media
        );

        formData.append(
          "upload_preset",
          "YOUR_UPLOAD_PRESET"
        );

        const cloudName =
          "YOUR_CLOUD_NAME";

        const resourceType =
          media.type.startsWith(
            "video"
          )
            ? "video"
            : media.type.startsWith(
                "image"
              )
            ? "image"
            : "video";

        const uploadRes =
          await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

        const uploadData =
          await uploadRes.json();

        uploadedMedia =
          uploadData.secure_url;

        mediaType =
          resourceType === "video"
            ? "video"
            : "image";
      }

      const newMessage =
        await fetchWithToken(
          `${API_BASE}/api/messages`,
          token,
          {
            method: "POST",
            body: JSON.stringify({
              receiver:
                selectedUser._id,
              text,
              media: uploadedMedia,
              mediaType,
            }),
          }
        );

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
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* MOBILE OVERLAY */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() =>
            setShowSidebar(false)
          }
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed md:relative z-40 md:z-0 top-0 left-0 h-full w-[320px] bg-white border-r shadow-2xl flex flex-col transform transition-transform duration-300 ${
          showSidebar
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* HEADER */}
        <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-blue-600">
            Messages
          </h1>

          <button
            onClick={() =>
              setShowSidebar(false)
            }
            className="md:hidden text-2xl"
          >
            ✕
          </button>
        </div>

        {/* USERS */}
        <div className="flex-1 overflow-y-auto">
          {friends.map((user) => (
            <motion.div
              whileHover={{
                scale: 1.01,
              }}
              key={user._id}
              onClick={() => {
                setSelectedUser(user);
                loadMessages(
                  user._id
                );
              }}
              className={`flex items-center gap-3 p-4 cursor-pointer transition border-b hover:bg-gray-100 ${
                selectedUser?._id ===
                user._id
                  ? "bg-blue-50"
                  : ""
              }`}
            >
              <div className="relative">
                <img
                  src={
                    user.profilePic ||
                    defaultProfile
                  }
                  alt=""
                  className="w-14 h-14 rounded-full object-cover"
                />

                <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white animate-pulse" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-800">
                  {user.name}
                </h2>

                <p className="text-sm text-gray-500">
                  Tap to chat
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {selectedUser ? (
          <>
            {/* TOP HEADER */}
            <div className="sticky top-0 z-30 bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() =>
                    setShowSidebar(true)
                  }
                  className="md:hidden text-2xl"
                >
                  ☰
                </button>

                <img
                  src={
                    selectedUser.profilePic ||
                    defaultProfile
                  }
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div className="min-w-0">
                  <h2 className="font-bold text-lg truncate text-gray-800">
                    {selectedUser.name}
                  </h2>

                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

                    <p className="text-sm text-green-500">
                      Online
                    </p>
                  </div>
                </div>
              </div>

              {/* CALL BUTTONS */}
              <div className="flex items-center gap-2">
                {/* VOICE */}
                <button
                  onClick={() =>
                    setShowVoiceCall(
                      true
                    )
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition"
                >
                  📞
                </button>

                {/* VIDEO */}
                <button
                  onClick={() =>
                    setShowCall(true)
                  }
                  className="bg-green-500 hover:bg-green-600 text-white w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition"
                >
                  📹
                </button>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-3 py-4 bg-gradient-to-b from-gray-50 to-gray-100 space-y-4">
              {messages.map(
                (msg, index) => {
                  const isMe =
                    msg.sender ===
                      currentUser ||
                    msg.sender?._id ===
                      currentUser;

                  return (
                    <motion.div
                      key={index}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className={`flex ${
                        isMe
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-3xl shadow-md break-words ${
                          isMe
                            ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-br-md"
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
                              src={
                                msg.media
                              }
                            />
                          </video>
                        )}

                        {/* AUDIO */}
                        {msg.mediaType ===
                          "audio" && (
                          <audio
                            controls
                            className="w-full mt-2"
                          >
                            <source
                              src={
                                msg.media
                              }
                            />
                          </audio>
                        )}

                        {/* TEXT */}
                        {msg.text && (
                          <p className="break-words">
                            {msg.text}
                          </p>
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
                          ).toLocaleTimeString(
                            [],
                            {
                              hour:
                                "2-digit",
                              minute:
                                "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </motion.div>
                  );
                }
              )}

              <div
                ref={messagesEndRef}
              ></div>
            </div>

            {/* INPUT AREA */}
            <div className="sticky bottom-0 z-30 bg-white border-t px-2 py-2 backdrop-blur-md">
              <div className="flex items-center gap-2">
                {/* FILE */}
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                  📎

                  <input
                    type="file"
                    accept="image/*,video/*"
                    hidden
                    onChange={(e) =>
                      setMedia(
                        e.target
                          .files[0]
                      )
                    }
                  />
                </label>

                {/* TEXT */}
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={text}
                  onChange={(e) =>
                    setText(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) =>
                    e.key ===
                      "Enter" &&
                    sendMessage()
                  }
                  className="flex-1 bg-gray-100 rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />

                {/* VOICE */}
                <div className="flex-shrink-0">
                  <VoiceRecorder
                    onSend={async (
                      audioUrl
                    ) => {
                      try {
                        const newMessage =
                          await fetchWithToken(
                            `${API_BASE}/api/messages`,
                            token,
                            {
                              method:
                                "POST",
                              body: JSON.stringify(
                                {
                                  receiver:
                                    selectedUser._id,
                                  media:
                                    audioUrl,
                                  mediaType:
                                    "audio",
                                }
                              ),
                            }
                          );

                        setMessages(
                          (prev) => [
                            ...prev,
                            newMessage,
                          ]
                        );

                        socketRef.current.emit(
                          "send-message",
                          newMessage
                        );
                      } catch (err) {
                        console.log(
                          err
                        );
                      }
                    }}
                  />
                </div>

                {/* SEND */}
                <button
                  onClick={
                    sendMessage
                  }
                  disabled={
                    uploading
                  }
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105 active:scale-95 text-white px-5 py-3 rounded-full font-semibold shadow-lg transition"
                >
                  {uploading
                    ? "..."
                    : "Send"}
                </button>
              </div>

              {/* FILE NAME */}
              {media && (
                <div className="mt-2 text-xs text-gray-500 truncate px-2">
                  📎 {media.name}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 relative">
            <button
              onClick={() =>
                setShowSidebar(true)
              }
              className="md:hidden absolute top-4 left-4 text-3xl"
            >
              ☰
            </button>

            <div className="text-7xl mb-4">
              💬
            </div>

            <div className="text-center px-4">
              <h2 className="text-3xl font-bold text-gray-700">
                Welcome to
                Messages
              </h2>

              <p className="text-gray-500 mt-2 text-lg">
                Select a user to
                start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* VIDEO CALL */}
      {showCall && (
        <VideoCall
          currentUser={currentUser}
          selectedUser={
            selectedUser
          }
          onClose={() =>
            setShowCall(false)
          }
        />
      )}

      {/* VOICE CALL */}
      {showVoiceCall && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 text-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
            <img
              src={
                selectedUser?.profilePic ||
                defaultProfile
              }
              alt=""
              className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-white"
            />

            <h2 className="text-2xl font-bold mt-5">
              {selectedUser?.name}
            </h2>

            <p className="text-gray-300 mt-2 animate-pulse">
              Calling...
            </p>

            {/* CONTROLS */}
            <div className="flex justify-center gap-5 mt-10">
              {/* SPEAKER */}
              <button className="bg-gray-700 hover:bg-gray-600 w-14 h-14 rounded-full text-2xl flex items-center justify-center transition">
                🔊
              </button>

              {/* MUTE */}
              <button className="bg-gray-700 hover:bg-gray-600 w-14 h-14 rounded-full text-2xl flex items-center justify-center transition">
                🎤
              </button>

              {/* END */}
              <button
                onClick={() =>
                  setShowVoiceCall(
                    false
                  )
                }
                className="bg-red-600 hover:bg-red-700 w-14 h-14 rounded-full text-2xl flex items-center justify-center transition"
              >
                ❌
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;