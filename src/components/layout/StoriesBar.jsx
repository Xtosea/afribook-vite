// src/components/layout/StoriesBar.jsx
import React, { useState, useEffect, useRef } from "react";
import { API_BASE } from "../../api/api";
import { getSocket } from "../../socket";
import StoryViewer from "../stories/StoryViewer";

const StoriesBar = ({ user }) => {
  const safeUser = user && typeof user === "object" && !user.$$typeof ? user : {};
  const fileRef = useRef();

  const [stories, setStories] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(null);
  const [uploading, setUploading] = useState(false);

  /* ================= FETCH STORIES ================= */
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stories`);
        const data = await res.json();
        setStories(data);
      } catch (err) {
        console.error("Failed to fetch stories:", err);
      }
    };
    fetchStories();

    const socket = getSocket();
    if (!socket) return;

    socket.on("new-story", (story) => setStories((prev) => [story, ...prev]));

    return () => {
      socket.off("new-story");
    };
  }, []);

  /* ================= HELPER: Convert file to Base64 ================= */
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (err) => reject(err);
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
      if (res.ok) {
        setStories((prev) => [data, ...prev]);
      } else {
        alert(data.error || "Story upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
    setUploading(false);
  };

  /* ================= VIEW STORY ================= */
  const handleOpenStory = (index) => setViewerIndex(index);
  const handleCloseViewer = () => setViewerIndex(null);

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {/* ADD STORY */}
        <div
          className={`min-w-[80px] h-32 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-sm cursor-pointer hover:ring-2 hover:ring-blue-500 ${
            uploading ? "opacity-50 cursor-wait" : ""
          }`}
          onClick={handleAddStory}
        >
          <img
            src={safeUser.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`}
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

        {/* OTHER STORIES */}
        {stories.slice(0, 10).map((story, index) => {
          const postUser =
            story.user && typeof story.user === "object" && !story.user.$$typeof
              ? story.user
              : {};
          return (
            <div
              key={story._id || index}
              className="min-w-[80px] h-32 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-gradient-to-t from-pink-500 via-yellow-400 to-purple-500 p-[2px]"
              onClick={() => handleOpenStory(index)}
            >
              <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center">
                <img
                  src={postUser.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`}
                  className="w-10 h-10 rounded-full mb-1 border-2 border-white"
                />
                <span className="text-xs text-center px-1">{postUser.name || "Unknown"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* STORY VIEWER */}
      {viewerIndex !== null && stories[viewerIndex] && (
        <StoryViewer
          stories={stories}
          index={viewerIndex}
          onClose={handleCloseViewer}
        />
      )}
    </>
  );
};

export default StoriesBar;