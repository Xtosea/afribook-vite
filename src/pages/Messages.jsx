// src/pages/Messages.jsx

import React, {
  useEffect,
  useState,
  useRef,
} from "react";

import { useParams } from "react-router-dom";

import { motion } from "framer-motion";

import {
  Phone,
  Video,
  Send,
  Paperclip,
  Menu,
  X,
} from "lucide-react";

import { connectSocket } from "../socket";

import {
  fetchWithToken,
  API_BASE,
} from "../api/api";

import VideoCall from "../components/VideoCall";
import VoiceRecorder from "../components/VoiceRecorder";
import VoiceCall from "../components/VoiceCall";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

const Messages = () => {
  const socketRef = useRef(null);

  const messagesEndRef =
    useRef(null);

  const currentUser =
    localStorage.getItem(
      "userId"
    );

  const token =
    localStorage.getItem(
      "token"
    );

  const { id } = useParams();

  const [friends, setFriends] =
    useState([]);

  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);

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

  // ================= SOCKET =================

  useEffect(() => {
    const socket =
      connectSocket();

    socketRef.current =
      socket;

    if (
      !socket ||
      !currentUser
    )
      return;

    socket.emit(
      "join",
      currentUser
    );

    // RECEIVE MESSAGE
    const handleReceiveMessage =
      (message) => {
        if (!selectedUser)
          return;

        const senderId =
          message.sender?._id ||
          message.sender;

        const receiverId =
          message.receiver?._id ||
          message.receiver;

        const isRelevant =
          senderId ===
            selectedUser._id ||
          receiverId ===
            selectedUser._id;

        if (!isRelevant)
          return;

        setMessages((prev) => {
          const exists =
            prev.some(
              (m) =>
                String(m._id) ===
                String(
                  message._id
                )
            );

          if (exists)
            return prev;

          return [
            ...prev,
            message,
          ];
        });
      };

    socket.on(
      "receive-message",
      handleReceiveMessage
    );

    return () => {
      socket.off(
        "receive-message",
        handleReceiveMessage
      );
    };
  }, [
    currentUser,
    selectedUser?._id,
  ]);

  // ================= AUTO SCROLL =================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [messages]);

  // ================= LOAD MESSAGES =================

  const loadMessages =
    async (userId) => {
      try {
        const data =
          await fetchWithToken(
            `${API_BASE}/api/messages/${userId}`,
            token
          );

        console.log(
          "MESSAGES:",
          data
        );

        setMessages(
          Array.isArray(data)
            ? data
            : data?.messages ||
                []
        );

        setShowSidebar(
          false
        );
      } catch (err) {
        console.log(
          "LOAD MESSAGE ERROR:",
          err
        );
      }
    };

  // ================= FETCH USERS =================

  useEffect(() => {
    const fetchUsers =
      async () => {
        try {
          const data =
            await fetchWithToken(
              `${API_BASE}/api/users`,
              token
            );

          const users =
            Array.isArray(
              data
            )
              ? data
              : data?.users ||
                [];

          setFriends(users);

          // OPEN USER FROM URL
          if (id) {
            const foundUser =
              users.find(
                (u) =>
                  u._id === id
              );

            if (
              foundUser
            ) {
              setSelectedUser(
                foundUser
              );

              loadMessages(
                foundUser._id
              );
            }
          }
        } catch (err) {
          console.log(
            "FETCH USER ERROR:",
            err
          );
        }
      };

    if (token) {
      fetchUsers();
    }
  }, [id, token]);

  // ================= SEND MESSAGE =================

  const sendMessage =
    async () => {
      if (
        !text.trim() &&
        !media
      )
        return;

      if (!selectedUser)
        return;

      try {
        setUploading(
          true
        );

        let uploadedMedia =
          "";

        let mediaType =
          "";

        // ========= UPLOAD FILE =========

        if (media) {
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
              : "auto";

          const uploadRes =
            await fetch(
              `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
              {
                method:
                  "POST",
                body: formData,
              }
            );

          const uploadData =
            await uploadRes.json();

          uploadedMedia =
            uploadData.secure_url;

          mediaType =
            media.type.startsWith(
              "video"
            )
              ? "video"
              : media.type.startsWith(
                  "audio"
                )
              ? "audio"
              : "image";
        }

        // ========= SAVE MESSAGE =========

        const res =
          await fetchWithToken(
            `${API_BASE}/api/messages`,
            token,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    receiver:
                      selectedUser._id,

                    text,

                    media:
                      uploadedMedia,

                    mediaType,
                  }
                ),
            }
          );

        console.log(
          "SEND RESPONSE:",
          res
        );

        const messageData =
          res?.message ||
          res?.data?.message ||
          res?.data ||
          res;

        if (!messageData)
          return;

        // ADD TO UI
        setMessages(
          (prev) => [
            ...prev,
            messageData,
          ]
        );

        // SOCKET
        socketRef.current?.emit(
          "send-message",
          messageData
        );

        setText("");
        setMedia(null);
      } catch (err) {
        console.log(
          "SEND ERROR:",
          err
        );
      } finally {
        setUploading(
          false
        );
      }
    };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* MOBILE OVERLAY */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() =>
            setShowSidebar(
              false
            )
          }
        />
      )}

      {/* ================= SIDEBAR ================= */}

      <div
        className={`fixed md:relative top-0 left-0 z-40 bg-white border-r w-[280px] h-full transform transition-transform duration-300 ${
          showSidebar
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="font-bold text-2xl text-blue-600">
            Messages
          </h1>

          <button
            className="md:hidden"
            onClick={() =>
              setShowSidebar(
                false
              )
            }
          >
            <X />
          </button>
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {friends.map(
            (user) => (
              <div
                key={
                  user._id
                }
                onClick={() => {
                  setSelectedUser(
                    user
                  );

                  loadMessages(
                    user._id
                  );
                }}
                className={`flex items-center gap-3 p-4 cursor-pointer border-b hover:bg-gray-100 ${
                  selectedUser?._id ===
                  user._id
                    ? "bg-blue-50"
                    : ""
                }`}
              >
                <img
                  src={
                    user.profilePic ||
                    defaultProfile
                  }
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div>
                  <h2 className="font-semibold">
                    {
                      user.name
                    }
                  </h2>

                  <p className="text-sm text-gray-500">
                    Tap to
                    chat
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* ================= CHAT AREA ================= */}

      <div className="flex-1 flex flex-col">

        {selectedUser ? (
          <>
            {/* HEADER */}

            <div className="bg-white border-b p-3 flex items-center justify-between sticky top-0 z-20">

              <div className="flex items-center gap-3">

                <button
                  className="md:hidden"
                  onClick={() =>
                    setShowSidebar(
                      true
                    )
                  }
                >
                  <Menu />
                </button>

                <img
                  src={
                    selectedUser.profilePic ||
                    defaultProfile
                  }
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div>
                  <h2 className="font-bold">
                    {
                      selectedUser.name
                    }
                  </h2>

                  <p className="text-sm text-green-500">
                    Online
                  </p>
                </div>
              </div>

              {/* CALL BUTTONS */}

              <div className="flex items-center gap-2">

                {/* VOICE CALL */}

                <button
                  onClick={() =>
                    setShowVoiceCall(
                      true
                    )
                  }
                  className="bg-blue-500 text-white w-11 h-11 rounded-full flex items-center justify-center"
                >
                  <Phone size={20} />
                </button>

                {/* VIDEO CALL */}

                <button
                  onClick={() =>
                    setShowCall(
                      true
                    )
                  }
                  className="bg-green-500 text-white w-11 h-11 rounded-full flex items-center justify-center"
                >
                  <Video size={20} />
                </button>
              </div>
            </div>

            {/* ================= MESSAGES ================= */}

            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-100">

              {messages.map(
                (
                  msg,
                  index
                ) => {
                  const senderId =
                    msg.sender
                      ?._id ||
                    msg.sender;

                  const isMe =
                    String(
                      senderId
                    ) ===
                    String(
                      currentUser
                    );

                  return (
                    <motion.div
                      key={
                        msg._id ||
                        index
                      }
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
                        className={`max-w-[80%] px-4 py-3 rounded-2xl shadow ${
                          isMe
                            ? "bg-blue-500 text-white"
                            : "bg-white text-black"
                        }`}
                      >

                        {/* IMAGE */}

                        {msg.mediaType ===
                          "image" && (
                          <img
                            src={
                              msg.media
                            }
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
                            className="w-full mb-2"
                          >
                            <source
                              src={
                                msg.media
                              }
                              type="audio/webm"
                            />
                          </audio>
                        )}

                        {/* TEXT */}

                        {msg.text && (
                          <p>
                            {
                              msg.text
                            }
                          </p>
                        )}

                        {/* TIME */}

                        <p className="text-[10px] mt-1 opacity-70">
                          {msg.createdAt
                            ? new Date(
                                msg.createdAt
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour:
                                    "2-digit",
                                  minute:
                                    "2-digit",
                                }
                              )
                            : ""}
                        </p>
                      </div>
                    </motion.div>
                  );
                }
              )}

              <div
                ref={
                  messagesEndRef
                }
              />
            </div>

            {/* ================= INPUT ================= */}

            <div className="bg-white border-t p-3">

              {/* FILE NAME */}

              {media && (
                <div className="text-xs text-gray-500 mb-2">
                  📎{" "}
                  {
                    media.name
                  }
                </div>
              )}

              <div className="flex items-center gap-2">

                {/* FILE */}

                <label className="bg-gray-100 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer">
                  <Paperclip
                    size={20}
                  />

                  <input
                    type="file"
                    hidden
                    accept="image/*,video/*"
                    onChange={(
                      e
                    ) =>
                      setMedia(
                        e.target
                          .files[0]
                      )
                    }
                  />
                </label>

                {/* VOICE NOTE */}

                <VoiceRecorder
                  onSend={async (
                    audioUrl
                  ) => {
                    try {
                      const res =
                        await fetchWithToken(
                          `${API_BASE}/api/messages`,
                          token,
                          {
                            method:
                              "POST",

                            headers:
                              {
                                "Content-Type":
                                  "application/json",
                              },

                            body:
                              JSON.stringify(
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

                      const newMessage =
                        res?.message ||
                        res?.data
                          ?.message ||
                        res;

                      setMessages(
                        (
                          prev
                        ) => [
                          ...prev,
                          newMessage,
                        ]
                      );

                      socketRef.current?.emit(
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

                {/* TEXT */}

                <input
                  type="text"
                  value={text}
                  placeholder="Type a message..."
                  onChange={(
                    e
                  ) =>
                    setText(
                      e.target
                        .value
                    )
                  }
                  onKeyDown={(
                    e
                  ) =>
                    e.key ===
                      "Enter" &&
                    sendMessage()
                  }
                  className="flex-1 border rounded-full px-4 py-3 outline-none"
                />

                {/* SEND */}

                <button
                  onClick={
                    sendMessage
                  }
                  disabled={
                    uploading
                  }
                  className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center"
                >
                  <Send
                    size={20}
                  />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">

            <button
              onClick={() =>
                setShowSidebar(
                  true
                )
              }
              className="md:hidden absolute top-4 left-4"
            >
              <Menu />
            </button>

            <div className="text-6xl">
              💬
            </div>

            <h2 className="text-2xl font-bold mt-4">
              Welcome to
              Messages
            </h2>

            <p className="text-gray-500 mt-2">
              Select a user
              to start
              chatting
            </p>
          </div>
        )}
      </div>

      {/* ================= VIDEO CALL ================= */}

      {showCall &&
        selectedUser && (
          <VideoCall
            currentUser={
              currentUser
            }
            selectedUser={
              selectedUser
            }
            onClose={() =>
              setShowCall(
                false
              )
            }
          />
        )}

      {/* ================= VOICE CALL ================= */}

      {showVoiceCall &&
        selectedUser && (
          <VoiceCall
            currentUser={
              currentUser
            }
            selectedUser={
              selectedUser
            }
            onClose={() =>
              setShowVoiceCall(
                false
              )
            }
          />
        )}
    </div>
  );
};

export default Messages;