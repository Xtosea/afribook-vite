// src/components/StoriesSection.jsx
import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "../api/api";
import { getSocket } from "../socket";

const StoriesSection = ({ user }) => {
  const [stories, setStories] = useState([]);
  const [viewer, setViewer] = useState(null);
  const [replyText, setReplyText] = useState("");
  const fileRef = useRef();

  /* ================= FETCH STORIES ================= */
  const fetchStories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stories`);
      const data = await res.json();
      setStories(data);
    } catch (err) {
      console.error("Fetch stories error:", err);
    }
  };

  useEffect(() => {
  fetchStories();

  const socket = getSocket();
  if (!socket) return;

  socket.on("new-story", (story) => {
    setStories((prev) => [story, ...prev]);
  });

  /* ================= STORY REPLY ================= */
  socket.on("story-reply", (data) => {
    console.log("Story reply received:", data);

    alert(`${data.from?.name || "Someone"} replied to your story`);
  });

  return () => {
    socket.off("new-story");
    socket.off("story-reply");
  };

}, []);

  /* ================= UPLOAD STORY ================= */

  const handleUploadClick = () => {
    fileRef.current.click();
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("video", file);

      const res = await fetch(`${API_BASE}/api/stories/upload-video`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setStories((prev) => [data, ...prev]);

    } catch (err) {
      console.error("Upload story error:", err);
    }
  };

  /* ================= VIEW STORY ================= */

  const openStory = (story) => {
    setViewer(story);
  };

  const closeStory = () => {
    setViewer(null);
    setReplyText("");
  };

  /* ================= SEND REPLY ================= */

  const sendReply = async () => {
    if (!replyText || !viewer) return;

    try {
      const token = localStorage.getItem("token");

      await fetch(
        `${API_BASE}/api/stories/reply/${viewer._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            text: replyText
          })
        }
      );

      setReplyText("");

    } catch (err) {
      console.error("Reply error", err);
    }
  };

  return (
    <>
      <div className="flex gap-3 overflow-x-auto py-2">

        {/* ADD STORY */}
        <div
          onClick={handleUploadClick}
          className="min-w-[80px] h-32 bg-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer"
        >
          <img
            src={
              user?.profilePic ||
              `${API_BASE}/uploads/profiles/default-profile.png`
            }
            className="w-10 h-10 rounded-full mb-1"
          />
          <span className="text-xs">Add Story</span>

          <input
            type="file"
            ref={fileRef}
            className="hidden"
            onChange={handleUpload}
            accept="image/*,video/*"
          />
        </div>

        {/* STORIES */}
        {stories.map((story) => (
          <div
            key={story._id}
            onClick={() => openStory(story)}
            className="min-w-[80px] h-32 rounded-lg cursor-pointer bg-gradient-to-t from-pink-500 via-yellow-400 to-purple-500 p-[2px]"
          >
            <div className="bg-white w-full h-full rounded-lg flex flex-col items-center justify-center">
              <img
                src={
                  story.user?.profilePic ||
                  `${API_BASE}/uploads/profiles/default-profile.png`
                }
                className="w-10 h-10 rounded-full mb-1"
              />
              <span className="text-xs text-center">
                {story.user?.name || "User"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ================= STORY VIEWER ================= */}

      {viewer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
          onClick={closeStory}
        >

          {/* STOP CLICK PROPAGATION */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >

            {viewer.media?.[0]?.type === "video" ? (
              <video
                src={viewer.media[0].url}
                autoPlay
                controls
                className="max-h-[90%] max-w-[90%]"
              />
            ) : (
              <img
                src={viewer.media?.[0]?.url}
                className="max-h-[90%] max-w-[90%]"
              />
            )}

            {/* REPLY INPUT */}
            <div className="absolute bottom-5 left-0 right-0 px-4 flex gap-2">
              <input
                value={replyText}
                onChange={(e)=>setReplyText(e.target.value)}
                placeholder="Reply to story..."
                className="flex-1 bg-white rounded-full px-4 py-2"
              />

              <button
                onClick={sendReply}
                className="bg-blue-500 text-white px-4 rounded-full"
              >
                Send
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default StoriesSection;