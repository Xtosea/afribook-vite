import React, {
  useEffect,
  useState,
  useRef,
} from "react";

import { useParams } from "react-router-dom";

import { connectSocket } from "../socket";

import {
  fetchWithToken,
  API_BASE,
} from "../api/api";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

const Messages = () => {
  const socketRef = useRef(null);

  const messagesEndRef = useRef(null);

  const currentUser =
    localStorage.getItem("userId");

  const token =
    localStorage.getItem("token");

  const { id } = useParams();

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

  // ================= SCROLL =================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ================= SOCKET =================

  useEffect(() => {
    const socket = connectSocket();

    socketRef.current = socket;

    if (!socket || !currentUser) return;

    socket.emit("join", currentUser);

    const handleReceiveMessage =
      (message) => {

        if (!selectedUser) return;

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

        if (!isRelevant) return;

        setMessages((prev) => {

          const exists =
            prev.some(
              (m) =>
                String(m._id) ===
                String(message._id)
            );

          if (exists) return prev;

          return [...prev, message];
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

  // ================= LOAD MESSAGES =================

  const loadMessages =
    async (userId) => {

      try {

        const data =
          await fetchWithToken(
            `${API_BASE}/api/messages/${userId}`,
            token
          );

        setMessages(data || []);

      } catch (err) {

        console.log(err);
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

          setFriends(data || []);

          if (id) {

            let foundUser =
              data.find(
                (u) =>
                  u._id === id
              );

            if (!foundUser) {

              foundUser =
                await fetchWithToken(
                  `${API_BASE}/api/users/${id}`,
                  token
                );
            }

            if (foundUser) {

              setSelectedUser(
                foundUser
              );

              loadMessages(
                foundUser._id
              );
            }
          }

        } catch (err) {

          console.log(err);
        }
      };

    fetchUsers();

  }, [id]);

  // ================= SEND MESSAGE =================

  const sendMessage =
    async () => {

      if (
        !text.trim() &&
        !media
      )
        return;

      try {

        let uploadedMedia =
          "";

        let mediaType =
          "";

        // ================= UPLOAD MEDIA =================

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

        // ================= SAVE MESSAGE =================

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

              body: JSON.stringify(
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

        const messageData =
          res?.data?.message ||
          res?.data ||
          res;

        // ================= UPDATE UI =================

        setMessages((prev) => [
          ...prev,
          messageData,
        ]);

        // ================= SOCKET =================

        socketRef.current?.emit(
          "send-message",
          messageData
        );

        setText("");

        setMedia(null);

      } catch (err) {

        console.log(err);

      } finally {

        setUploading(false);
      }
    };

  return (
    <div className="flex h-screen bg-gray-100">

      {/* ================= SIDEBAR ================= */}

      <div className="w-[320px] bg-white border-r overflow-y-auto">

        <div className="p-4 text-2xl font-bold text-blue-600">
          Messages
        </div>

        {friends.map((user) => (

          <div
            key={user._id}
            onClick={() => {

              setSelectedUser(
                user
              );

              loadMessages(
                user._id
              );
            }}
            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 ${
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
                {user.name}
              </h2>

              <p className="text-sm text-gray-500">
                Tap to chat
              </p>

            </div>
          </div>
        ))}
      </div>

      {/* ================= CHAT AREA ================= */}

      <div className="flex-1 flex flex-col">

        {selectedUser ? (
          <>

            {/* HEADER */}

            <div className="p-4 border-b bg-white flex items-center gap-3">

              <img
                src={
                  selectedUser.profilePic ||
                  defaultProfile
                }
                alt=""
                className="w-12 h-12 rounded-full"
              />

              <div>

                <h2 className="font-bold text-lg">
                  {
                    selectedUser.name
                  }
                </h2>

                <p className="text-sm text-green-500">
                  Online
                </p>

              </div>
            </div>

            {/* MESSAGES */}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">

              {messages.map(
                (msg) => {

                  const senderId =
                    msg.sender?._id ||
                    msg.sender;

                  const isMe =
                    String(
                      senderId
                    ) ===
                    String(
                      currentUser
                    );

                  return (

                    <div
                      key={msg._id}
                      className={`flex ${
                        isMe
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      <div
                        className={`max-w-[75%] p-3 rounded-2xl shadow ${
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
                            className="rounded-xl mb-2"
                          />
                        )}

                        {/* VIDEO */}

                        {msg.mediaType ===
                          "video" && (
                          <video
                            controls
                            className="rounded-xl mb-2"
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

                        <p className="text-[11px] opacity-70 mt-1">

                          {msg.createdAt &&
                            new Date(
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
                    </div>
                  );
                }
              )}

              <div
                ref={
                  messagesEndRef
                }
              />
            </div>

            {/* INPUT */}

            <div className="p-3 bg-white border-t flex gap-2">

              <input
                type="text"
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
                placeholder="Type message..."
                className="flex-1 border rounded-xl px-3 py-2 outline-none"
              />

              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) =>
                  setMedia(
                    e.target.files[0]
                  )
                }
              />

              <button
                onClick={
                  sendMessage
                }
                disabled={
                  uploading
                }
                className="bg-blue-500 text-white px-5 rounded-xl"
              >
                {uploading
                  ? "..."
                  : "Send"}
              </button>
            </div>
          </>
        ) : (

          <div className="flex items-center justify-center flex-1 text-gray-500 text-xl">

            Select a user to start chatting

          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;