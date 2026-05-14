import React, { useRef, useState, useEffect } from "react";
import { getSocket } from "../../socket";
import { useStoryUpload } from "../../hooks/useStoryUpload";
import { API_BASE } from "../../api/api";

const StoriesBar = ({ user, stories = [] }) => {
  const safeUser =
    user && typeof user === "object" && !user.$$typeof
      ? user
      : {};

  const fileRef = useRef();

  const socket = getSocket();

  const {
    uploadStory,
    loading,
    progress,
  } = useStoryUpload();

  const [storiesLikes, setStoriesLikes] = useState({});
  const [heartAnim, setHeartAnim] = useState({});
  const [activeStories, setActiveStories] =
    useState(stories);

  // Open picker
  const handleAddStory = () => {
    fileRef.current?.click();
  };

  // Upload story
  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const story = await uploadStory(file);

      if (story?._id) {
        socket?.emit("new-story", story);

        setActiveStories((prev) => [
          story,
          ...prev,
        ]);
      }
    } catch (err) {
      console.error(
        "Story upload failed:",
        err
      );
    }
  };

  // Like story
  const handleLikeStory = async (story) => {
    if (!story?._id) return;

    setHeartAnim((prev) => ({
      ...prev,
      [story._id]: true,
    }));

    setTimeout(() => {
      setHeartAnim((prev) => ({
        ...prev,
        [story._id]: false,
      }));
    }, 800);

    const token =
      localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_BASE}/api/stories/like/${story._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setStoriesLikes((prev) => ({
          ...prev,
          [story._id]: data.likes,
        }));

        socket?.emit("story-liked", {
          storyId: story._id,
          likes: data.likes,
        });
      }
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleStoryLiked = ({
      storyId,
      likes,
    }) => {
      setStoriesLikes((prev) => ({
        ...prev,
        [storyId]: likes,
      }));
    };

    const handleNewStory = (story) => {
      setActiveStories((prev) => [
        story,
        ...prev,
      ]);
    };

    socket.on(
      "story-liked",
      handleStoryLiked
    );

    socket.on(
      "new-story",
      handleNewStory
    );

    return () => {
      socket.off(
        "story-liked",
        handleStoryLiked
      );

      socket.off(
        "new-story",
        handleNewStory
      );
    };
  }, [socket]);

  // Remove expired stories
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStories((prev) =>
        prev.filter(
          (story) =>
            new Date(story.expiresAt) >
            new Date()
        )
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">

      {/* YOUR STORY */}
      <div
        className={`min-w-[80px] h-32 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-sm cursor-pointer hover:ring-2 hover:ring-blue-500 relative overflow-hidden ${
          loading
            ? "opacity-70 cursor-wait"
            : ""
        }`}
        onClick={handleAddStory}
      >
        <img
          src={
            safeUser.profilePic ||
            `${API_BASE}/uploads/profiles/default-profile.png`
          }
          className="w-10 h-10 rounded-full mb-1 object-cover"
        />

        <span className="text-xs font-medium">
          {loading
            ? "Uploading..."
            : "Add Story"}
        </span>

        {/* Upload Progress */}
        {loading && (
          <div className="absolute bottom-0 left-0 w-full px-2 pb-2">
            <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-2 bg-blue-500 transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <p className="text-[10px] text-center mt-1">
              {progress}%
            </p>
          </div>
        )}

        <input
          type="file"
          ref={fileRef}
          onChange={handleUpload}
          className="hidden"
          accept="image/*,video/*"
        />
      </div>

      {/* STORIES */}
      {activeStories
        .slice(0, 10)
        .map((story) => {
          const storyUser =
            story.user || {};

          return (
            <div
              key={story._id}
              className="min-w-[80px] h-32 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-gradient-to-t from-pink-500 via-yellow-400 to-purple-500 p-[2px]"
              onDoubleClick={() =>
                handleLikeStory(story)
              }
            >
              <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center relative overflow-hidden">

                <img
                  src={
                    storyUser.profilePic ||
                    `${API_BASE}/uploads/profiles/default-profile.png`
                  }
                  className="w-10 h-10 rounded-full mb-1 border-2 border-white object-cover"
                />

                <span className="text-xs text-center px-1">
                  {storyUser.name ||
                    "Unknown"}
                </span>

                <span className="text-[10px] mt-1 text-gray-700">
                  ❤️{" "}
                  {storiesLikes[
                    story._id
                  ] ??
                    story.likes ??
                    0}
                </span>

                {heartAnim[story._id] && (
                  <span className="absolute text-4xl animate-ping text-red-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    ❤️
                  </span>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default StoriesBar;