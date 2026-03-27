// src/components/layout/StoriesBar.jsx
import React, { useRef, useState, useEffect } from "react";
import { getSocket } from "../../socket";
import { useStoryUpload } from "../../hooks/useStoryUpload";

const StoriesBar = ({ user, stories = [] }) => {
  const safeUser = user || {};
  const fileRef = useRef();
  const socket = getSocket();
  const { uploadStory, loading: uploading } = useStoryUpload();

  const [storiesState, setStoriesState] = useState(stories);
  const [storiesLikes, setStoriesLikes] = useState({});
  const [heartAnim, setHeartAnim] = useState({});

  // Open file picker
  const handleAddStory = () => fileRef.current.click();

  // Upload story
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const uploadedStory = await uploadStory(files);
    if (uploadedStory) {
      setStoriesState((prev) => [uploadedStory, ...prev]);
      socket?.emit("new-story", uploadedStory);
    }
  };

  // Like story
  const handleLikeStory = async (story) => {
    if (!story?._id) return;

    setHeartAnim((prev) => ({ ...prev, [story._id]: true }));
    setTimeout(() => setHeartAnim((prev) => ({ ...prev, [story._id]: false })), 800);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/stories/like/${story._id}`, {
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

  // Listen to socket likes
  useEffect(() => {
    if (!socket) return;
    const handleStoryLiked = ({ storyId, likes }) => {
      setStoriesLikes((prev) => ({ ...prev, [storyId]: likes }));
    };
    socket.on("story-liked", handleStoryLiked);
    return () => socket.off("story-liked", handleStoryLiked);
  }, [socket]);

  // Listen to new stories
  useEffect(() => {
    if (!socket) return;
    const handleNewStory = (story) => setStoriesState((prev) => [story, ...prev]);
    socket.on("new-story", handleNewStory);
    return () => socket.off("new-story", handleNewStory);
  }, [socket]);

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
            src={safeUser.profilePic || "/default-profile.png"}
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
        {storiesState.slice(0, 10).map((story) => {
          const storyUser = story.user || {};
          return (
            <div
              key={story._id}
              className="min-w-[80px] h-32 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-gradient-to-t from-pink-500 via-yellow-400 to-purple-500 p-[2px]"
              onDoubleClick={() => handleLikeStory(story)}
            >
              <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center relative">
                <img
                  src={storyUser.profilePic || "/default-profile.png"}
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