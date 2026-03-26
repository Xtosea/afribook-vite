// src/components/layout/StoriesBar.jsx
import React, { useRef, useState, useEffect } from "react";
import { API_BASE } from "../../api/api";
import { getSocket } from "../../socket";

const StoriesBar = ({ user, posts = [] }) => {
  const safeUser = user && typeof user === "object" && !user.$$typeof ? user : {};
  const fileRef = useRef();
  const socket = getSocket();

  const [uploading, setUploading] = useState(false);
  const [storiesLikes, setStoriesLikes] = useState({});
  const [heartAnim, setHeartAnim] = useState({});

  /* ================= HELPER: Convert file to Base64 ================= */
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  /* ================= ADD STORY ================= */
  const handleAddStory = () => fileRef.current.click();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const base64 = await toBase64(file);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/stories/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          base64,
        }),
      });

      const data = await res.json();
      if (res.ok && data?._id) {
        socket?.emit("new-story", data);
      } else {
        console.error("Upload failed", data);
      }
    } catch (err) {
      console.error("Story upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  /* ================= DOUBLE TAP LIKE ================= */
  const handleLikeStory = async (story) => {
    if (!story?._id) return;

    setHeartAnim((prev) => ({ ...prev, [story._id]: true }));
    setTimeout(() => setHeartAnim((prev) => ({ ...prev, [story._id]: false })), 800);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/api/stories/like/${story._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStoriesLikes((prev) => ({ ...prev, [story._id]: data.likes }));
        socket?.emit("story-liked", { storyId: story._id, likes: data.likes });
      }
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  /* ================= SOCKET: Listen for likes ================= */
  useEffect(() => {
    if (!socket) return;

    const handleStoryLiked = ({ storyId, likes }) => {
      setStoriesLikes((prev) => ({ ...prev, [storyId]: likes }));
    };

    socket.on("story-liked", handleStoryLiked);

    return () => {
      socket.off("story-liked", handleStoryLiked);
    };
  }, [socket]);

  /* ================= RENDER ================= */
  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {/* YOUR STORY */}
        <div
          className={`min-w-[80px] h-32 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-sm cursor-pointer hover:ring-2 hover:ring-blue-500 ${
            uploading ? "opacity-50 cursor-wait" : ""
          }`}
          onClick={handleAddStory}
        >
          <img
            src={
              safeUser.profilePic ||
              `${API_BASE}/uploads/profiles/default-profile.png`
            }
            className="w-10 h-10 rounded-full mb-1"
          />
          {uploading ? "Uploading..." : "Add Story"}
          <input
            type="file"
            ref={fileRef}
            onChange={handleUpload}
            className="hidden"
            accept="image/*,video/*"
          />
        </div>

        {/* OTHERS STORIES */}
        {posts.slice(0, 10).map((story) => {
          const storyUser =
            story.user && typeof story.user === "object" && !story.user.$$typeof
              ? story.user
              : {};

          return (
            <div
              key={story._id}
              className="min-w-[80px] h-32 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-gradient-to-t from-pink-500 via-yellow-400 to-purple-500 p-[2px]"
              onDoubleClick={() => handleLikeStory(story)}
            >
              <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center relative">
                <img
                  src={
                    storyUser.profilePic ||
                    `${API_BASE}/uploads/profiles/default-profile.png`
                  }
                  className="w-10 h-10 rounded-full mb-1 border-2 border-white"
                />
                <span className="text-xs text-center px-1">
                  {storyUser.name || "Unknown"}
                </span>
                <span className="text-[10px] mt-1 text-gray-700">
                  ❤️ {storiesLikes[story._id] ?? story.likes ?? 0}
                </span>
                {heartAnim[story._id] && (
                  <span className="absolute text-4xl animate-pop text-red-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    ❤️
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= ANIMATION CSS ================= */}
      <style>
        {`
          @keyframes pop {
            0% { transform: scale(0.5); opacity: 0; }
            50% { transform: scale(1.3); opacity: 1; }
            100% { transform: scale(1); opacity: 0; }
          }
          .animate-pop {
            animation: pop 0.8s ease-out forwards;
          }
        `}
      </style>
    </>
  );
};

export default StoriesBar;