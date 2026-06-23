import React, {
  useEffect,
  useState,
  useRef,
} from "react";

import { useParams } from "react-router-dom";

import { motion } from "framer-motion";

import { connectSocket } from "../socket";

import {
  fetchWithToken,
  API_BASE,
} from "../api/api";

import VideoCall from "../components/VideoCall";
import VoiceRecorder from "../components/VoiceRecorder";
import VoiceCall from "../components/VoiceCall";
import SponsoredAd from "../components/SponsoredAd";



const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

/* AUDIO MESSAGE COMPONENT */
const AudioMessage = ({
  src,
  isMe,
  onDelete,
}) => {

  const audioRef =
    useRef(null);



  const [playing, setPlaying] =
    useState(false);

  const [muted, setMuted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // PLAY / PAUSE
  const togglePlay =
    async () => {

      if (!audioRef.current)
        return;

      try {

        if (playing) {

          audioRef.current.pause();

          setPlaying(false);

        } else {

          setLoading(true);

          await audioRef.current.play();

          setPlaying(true);

          setLoading(false);
        }

      } catch (err) {

        console.log(
          "Audio play error:",
          err
        );

        setLoading(false);
      }
    };

  // MUTE
  const toggleMute =
    () => {

      if (!audioRef.current)
        return;

      audioRef.current.muted =
        !muted;

      setMuted(!muted);
    };

  return (
    <div className="flex items-center gap-2 mt-2 w-full">

      {/* PLAY BUTTON */}
      <button
        onClick={togglePlay}
        className={`w-11 h-11 rounded-full flex items-center justify-center text-lg shadow transition ${
          isMe
            ? "bg-white/20 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        {loading
          ? "..."
          : playing
          ? "⏸"
          : "▶"}
      </button>

      {/* AUDIO BODY */}
      <div
        className={`flex-1 rounded-2xl px-3 py-2 overflow-hidden ${
          isMe
            ? "bg-white/10"
            : "bg-gray-100"
        }`}
      >

        {/* TOP ROW */}
        <div className="flex items-center justify-between">

          <p
            className={`text-sm font-medium ${
              isMe
                ? "text-white"
                : "text-gray-700"
            }`}
          >
            🎙 Voice note
          </p>

          <div className="flex items-center gap-2">

            {/* MUTE */}
            <button
              onClick={toggleMute}
              className="text-xs"
            >
              {muted
                ? "🔇"
                : "🔊"}
            </button>

            {/* DELETE */}
            {isMe && (
              <button
                onClick={onDelete}
                className="text-xs text-red-400"
              >
                🗑
              </button>
            )}

          </div>
        </div>

        {/* WAVEFORM */}
        <div className="flex items-center gap-[3px] h-6 mt-2">

          <div className="w-1 h-2 bg-current rounded animate-pulse" />
          <div className="w-1 h-4 bg-current rounded animate-pulse" />
          <div className="w-1 h-3 bg-current rounded animate-pulse" />
          <div className="w-1 h-5 bg-current rounded animate-pulse" />
          <div className="w-1 h-2 bg-current rounded animate-pulse" />
          <div className="w-1 h-4 bg-current rounded animate-pulse" />
          <div className="w-1 h-3 bg-current rounded animate-pulse" />
          <div className="w-1 h-5 bg-current rounded animate-pulse" />
        </div>

        {/* AUDIO */}
        <audio
          ref={audioRef}
          preload="metadata"
          onEnded={() =>
            setPlaying(false)
          }
          onPause={() =>
            setPlaying(false)
          }
        >
          <source
            src={src}
            type="audio/webm"
          />
        </audio>

      </div>
    </div>
  );
};

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

  const [showCall, setShowCall] =
    useState(false);

  const [
    showVoiceCall,
    setShowVoiceCall,
  ] = useState(false);

const [editText, setEditText] = useState("");
const [editingMessageId, setEditingMessageId] =
  useState(null);
const [openMenuId, setOpenMenuId] = useState(null);



  const [showSidebar, setShowSidebar] =
    useState(false);


const menuRef = useRef(null);



const startEditMessage = (msg) => {
  setEditingMessageId(msg._id);
  setEditText(msg.text || "");
};




const saveEditMessage = async (messageId) => {
  try {
    const updated = await fetchWithToken(
      `${API_BASE}/api/messages/${messageId}`,
      token,
      {
        method: "PUT",
        body: JSON.stringify({
          text: editText,
        }),
      }
    );

    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? updated : msg
      )
    );

    socketRef.current?.emit("message-edited", updated);

    setEditingMessageId(null);
    setEditText("");

  } catch (err) {
    console.log(err);
  }
};



const deleteMessage = async (messageId) => {
  try {
    await fetchWithToken(
      `${API_BASE}/api/messages/${messageId}`,
      token,
      { method: "DELETE" }
    );

    setMessages((prev) =>
      prev.filter((m) => m._id !== messageId)
    );

    socketRef.current?.emit("message-deleted", {
      messageId,
    });
  } catch (err) {
    console.log(err);
  }
};


const deleteForMe = (messageId) => {
  setMessages((prev) =>
    prev.filter((msg) => msg._id !== messageId)
  );
};


const deleteForEveryone = async (messageId) => {

const confirmed = window.confirm(
  "Delete this message for everyone?"
);

if (!confirmed) return;
  try {
    await fetchWithToken(
      `${API_BASE}/api/messages/${messageId}/everyone`,
      token,
      { method: "DELETE" }
    );

    setMessages((prev) =>
      prev.filter((msg) => msg._id !== messageId)
    );

    socketRef.current?.emit("message-deleted", {
      messageId,
    });

  } catch (err) {
    console.log(err);
  }
};


useEffect(() => {
  const handleClickOutside = (e) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(e.target)
    ) {
      setOpenMenuId(null);
    }
  };

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () =>
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
}, []);

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
      (
        message.sender === selectedUser._id ||
        message.receiver === selectedUser._id ||
        message.sender?._id === selectedUser._id
      )
    ) {
      setMessages(prev => [...prev, message]);
    }
  }
);

socket.on(
  "message-deleted",
  ({ messageId }) => {
    setMessages(prev =>
      prev.filter(
        msg => msg._id !== messageId
      )
    );
  }
);

socket.on(
  "message-edited",
  (updatedMessage) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === updatedMessage._id
          ? updatedMessage
          : msg
      )
    );
  }
);

    return () => {
  socket.off("receive-message");
  socket.off("message-deleted");
  socket.off("message-edited");
};
  }, [selectedUser, currentUser]);

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
        const data =
          await fetchWithToken(
            `${API_BASE}/api/users`,
            token
          );

        setFriends(data || []);

        // OPEN CHAT FROM URL
        if (id) {
          let foundUser = data.find(
            (u) => u._id === id
          );

          // FETCH USER DIRECTLY
          if (!foundUser) {
            try {
              foundUser =
                await fetchWithToken(
                  `${API_BASE}/api/users/${id}`,
                  token
                );
            } catch (err) {
              console.log(
                "User fetch failed",
                err
              );
            }
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





    // SEND MESSAGE
  const sendMessage = async () => {
    if (
      !text.trim() &&
      !media
    )
      return;

    try {
      let uploadedMedia = "";
      let mediaType = "";

      // UPLOAD MEDIA
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
          "joblink_unsigned"
        );

        const cloudName =
          "dycqfqqlc";

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
              method: "POST",
              body: formData,
            }
          );

        const uploadData =
 await uploadRes.json();

console.log(
  "Cloudinary response:",
  uploadData
);

if(uploadData.error){
  throw new Error(
    uploadData.error.message
  );
}

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

      console.log({
        receiver: selectedUser._id,
        text,
        media: uploadedMedia,
        mediaType,
      });

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

      console.log(
  "Voice message response:",
  newMessage
);

      setMessages((prev) => [
        ...prev,
        newMessage,
      ]);

      socketRef.current?.emit(
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

  // ADSTERRA
  useEffect(() => {
    const script =
      document.createElement(
        "script"
      );

    script.src =
      "https://pl29467278.effectivecpmnetwork.com/1ac49ab91139c0ad3e13572497cfbe18/invoke.js";

    script.async = true;

    script.setAttribute(
      "data-cfasync",
      "false"
    );

    document.body.appendChild(
      script
    );

    return () => {
      document.body.removeChild(
        script
      );
    };
  }, []);




    return (
    <div className="flex h-full bg-gray-100 overflow-hidden">

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
            {/* HEADER */}
            <div className="sticky top-0 z-30 bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between">

              <div className="flex items-center gap-3">

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

                <div>
                  <h2 className="font-bold text-lg text-gray-800">
                    {selectedUser.name}
                  </h2>

                  <p className="text-sm text-green-500">
                    Online
                  </p>
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
                  className="bg-blue-500 hover:bg-blue-600 text-white w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
                >
                  📞
                </button>

                {/* VIDEO */}
                <button
                  onClick={() =>
                    setShowCall(true)
                  }
                  className="bg-green-500 hover:bg-green-600 text-white w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
                >
                  📹
                </button>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-3 py-4 pb-32 md:pb-4 bg-gradient-to-b from-gray-50 to-gray-100 space-y-4">

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
  className={`max-w-[85%] overflow-hidden px-4 py-3 rounded-3xl shadow-md break-words ${
    isMe
      ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-br-md ml-auto"
      : "bg-white text-gray-800 rounded-bl-md mr-auto"
  }`}
>
           

{/* 3 DOT BUTTON */}             
<div className="relative">

  {isMe && (
    <div className="flex justify-end mb-1">
      <button
        onClick={() =>
          setOpenMenuId(
            openMenuId === msg._id
              ? null
              : msg._id
          )
        }
        className="text-lg"
      >
        ⋮
      </button>
    </div>
  )}

  {msg.text && <p>{msg.text}</p>}

</div>

{/* MENU */}
{openMenuId === msg._id && (
  <div
    ref={menuRef}
    className="
      absolute
      top-8
      right-2
      bg-white
      shadow-lg
      rounded-lg
      w-40
      z-50
      border
    "
  >
    <button
      onClick={() => {
        startEditMessage(msg);
        setOpenMenuId(null);
      }}
      className="
        w-full
        text-left
        px-3
        py-2
        hover:bg-gray-100
        text-sm
      "
    >
      ✏ Edit message
    </button>

    <button
      onClick={() => {
        deleteForMe(msg._id);
        setOpenMenuId(null);
      }}
      className="
        w-full
        text-left
        px-3
        py-2
        hover:bg-gray-100
        text-sm
      "
    >
      🗑 Delete for me
    </button>

    <button
      onClick={() => {
        deleteForEveryone(msg._id);
        setOpenMenuId(null);
      }}
      className="
        w-full
        text-left
        px-3
        py-2
        text-red-500
        hover:bg-gray-100
        text-sm
      "
    >
      ❌ Delete for everyone
    </button>
  </div>
)}


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
                        {msg.mediaType === "audio" && (
                          <AudioMessage
  src={msg.media}
  isMe={isMe}
  onDelete={() => {
    setMessages((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  }}
/>
                        )}

                        {/* TEXT OR EDIT MODE */}
{editingMessageId === msg._id ? (
  <div className="mt-2 space-y-2">

    <textarea
      value={editText}
      onChange={(e) =>
        setEditText(e.target.value)
      }
      className="w-full p-2 rounded-lg border text-black"
      rows={3}
    />

    <div className="flex gap-2">

      <button
  type="button"
  onClick={() =>
    saveEditMessage(msg._id)
  }
  className="
    bg-green-500
    text-white
    px-3
    py-1
    rounded
  "
>
  Save
</button>

      <button
  type="button"
  onClick={() => {
    setEditingMessageId(null);
    setEditText("");
  }}
  className="
    bg-gray-500
    text-white
    px-3
    py-1
    rounded
  "
>
  Cancel
</button>

    </div>
  </div>
) : (
  msg.text && (
    <div>
  <p>{msg.text}</p>

  {msg.updatedAt &&
   msg.updatedAt !== msg.createdAt && (
    <span className="text-[10px] opacity-70">
      (edited)
    </span>
  )}
</div>
  )
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
                      </div>
                    </motion.div>
                  );
                }
              )}

              <div
                ref={messagesEndRef}
              />
            </div>

            {/* INPUT AREA */}
            <div className="sticky bottom-[70px] md:bottom-0 z-30 bg-white border-t px-3 py-3 shadow-lg">

              <div className="space-y-2">

                {/* INPUT */}
                <div className="flex items-center bg-gray-100 rounded-3xl px-3 py-2">

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
                    className="flex-1 bg-transparent px-2 py-4 outline-none text-[15px]"
                  />
                </div>

                {/* BUTTONS */}
                <div className="flex items-center justify-between gap-2">

                  <div className="flex items-center gap-2">

                    {/* FILE */}
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 w-12 h-12 rounded-full flex items-center justify-center text-xl shadow">

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

                    {/* VOICE NOTE */}
                    <div className="bg-gray-100 rounded-full p-1 shadow">

                      <VoiceRecorder
                        receiverId={
                          selectedUser._id
                        }
                        token={token}
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
                    </div>
                  </div>

                  {/* SEND */}
                  <button
                    onClick={
                      sendMessage
                    }
                    disabled={
                      uploading
                    }
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
                  >
                    {uploading
                      ? "..."
                      : "Send"}
                  </button>
                </div>

                {/* FILE NAME */}
                {media && (
                  <div className="text-xs text-gray-500 truncate px-2">
                    📎 {media.name}
                  </div>
                )}
              </div>
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

            <div
              id="container-1ac49ab91139c0ad3e13572497cfbe18"
              className="my-4"
            />

            <div className="text-center px-4">
              <h2 className="text-3xl font-bold text-gray-700">
                Welcome to
                Message Room
              </h2>

              <p className="text-gray-500 mt-2 text-lg">
                Click on the left top menu to select a user to chat with.
                 
              </p>
            </div>
          </div>
        )}
      </div>

      {/* VIDEO CALL */}
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
              setShowCall(false)
            }
          />
        )}

      {/* VOICE CALL */}
      {showVoiceCall && (
  <VoiceCall
    currentUser={currentUser}
    selectedUser={selectedUser}
    socket={socketRef.current}
    onClose={() =>
      setShowVoiceCall(false)
    }
    defaultProfile={defaultProfile}
  />
)}
   </div>
  );
};

export default Messages;