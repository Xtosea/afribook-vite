// src/components/layout/StoriesBar.jsx
import React, { useRef, useState } from "react";
import { API_BASE } from "../../api/api";

const StoriesBar = ({ user, posts = [] }) => {
  const safeUser = user && typeof user === "object" && !user.$$typeof ? user : {};
  const fileRef = useRef();

  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState(null);

  /* ================= ADD STORY ================= */
  const handleAddStory = () => fileRef.current.click();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("media", file);

    const token = localStorage.getItem("token");

    try {
      await fetch(`${API_BASE}/api/stories/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      window.location.reload(); // reload to see the new story
    } catch (err) {
      console.error("Story upload failed:", err);
    }
  };

  /* ================= VIEW STORY ================= */
  const handleOpenStory = (post) => {
    setCurrentStory(post);
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setCurrentStory(null);
  };

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {/* YOUR STORY */}
        <div
          className="min-w-[80px] h-32 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-sm cursor-pointer hover:ring-2 hover:ring-blue-500"
          onClick={handleAddStory}
        >
          <img
            src={safeUser.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`}
            className="w-10 h-10 rounded-full mb-1"
          />
          Add Story
          <input
            type="file"
            ref={fileRef}
            onChange={handleUpload}
            className="hidden"
            accept="image/*,video/*"
          />
        </div>

        {/* OTHERS' STORIES */}
        {posts.slice(0, 10).map((post) => {
          const postUser = post.user && typeof post.user === "object" && !post.user.$$typeof ? post.user : {};
          return (
            <div
              key={post._id || Math.random()}
              className="min-w-[80px] h-32 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-gradient-to-t from-pink-500 via-yellow-400 to-purple-500 p-[2px]"
              onClick={() => handleOpenStory(post)}
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

      {/* ================= STORY VIEWER MODAL ================= */}
      {viewerOpen && currentStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={handleCloseViewer}
        >
          {currentStory.media && currentStory.media[0] && (
            <>
              {currentStory.media[0].type === "video" ? (
                <video
                  src={currentStory.media[0].url}
                  controls
                  autoPlay
                  className="max-h-[90%] max-w-[90%]"
                />
              ) : (
                <img
                  src={currentStory.media[0].url}
                  className="max-h-[90%] max-w-[90%]"
                />
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default StoriesBar;