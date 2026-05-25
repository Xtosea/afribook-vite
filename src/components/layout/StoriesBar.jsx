import React, {
  useRef,
  useState,
  useEffect,
} from "react";

import { getSocket } from "../../socket";
import { useStoryUpload } from "../../hooks/useStoryUpload";
import { API_BASE } from "../../api/api";

const StoriesBar = ({
  user,
  stories = [],
}) => {
  const safeUser =
    user &&
    typeof user === "object" &&
    !user.$$typeof
      ? user
      : {};

  const fileRef = useRef();

  const socket = getSocket();

  const {
    uploadStory,
    loading,
    progress,
  } = useStoryUpload();

  const [storiesLikes, setStoriesLikes] =
    useState({});

  const [heartAnim, setHeartAnim] =
    useState({});

  const [activeStories, setActiveStories] =
    useState(stories);

  const [selectedStory, setSelectedStory] =
    useState(null);

  // Sync incoming stories
  useEffect(() => {
    setActiveStories(stories);
  }, [stories]);

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
        setActiveStories((prev) => [
          story,
          ...prev,
        ]);

        socket?.emit("new-story", story);
      }
    } catch (err) {
      console.error(
        "Story upload failed:",
        err
      );
    }
  };

  // Like story
  const handleLikeStory = async (
    story
  ) => {
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
    }, 700);

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
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewStory = (story) => {
      setActiveStories((prev) => [
        story,
        ...prev,
      ]);
    };

    socket.on(
      "new-story",
      handleNewStory
    );

    return () => {
      socket.off(
        "new-story",
        handleNewStory
      );
    };
  }, [socket]);

  return (
console.log("USER:", user);
    <>
      <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar">

        {/* ADD STORY */}
        <div
          onClick={handleAddStory}
          className="relative min-w-[110px] h-44 rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-b from-gray-200 to-gray-400 flex flex-col items-center justify-center shadow-lg"
        >
          <img
  src={
    safeUser.profilePic
      ? safeUser.profilePic.startsWith(
          "http"
        )
        ? safeUser.profilePic
        : `${API_BASE}${safeUser.profilePic}`
      : "/default-avatar.png"
  }
  className="w-14 h-14 rounded-full border-4 border-white object-cover"
/>

          <p className="text-sm font-semibold mt-2">
            Your Story
          </p>

          <div className="absolute bottom-3 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-2xl shadow-lg">
            +
          </div>

          {/* Upload progress */}
          {loading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">

              <div className="w-16 h-16 rounded-full border-4 border-white border-t-transparent animate-spin" />

              <p className="text-white mt-3 text-sm">
                {progress}%
              </p>
            </div>
          )}

          <input
            type="file"
            ref={fileRef}
            className="hidden"
            accept="image/*,video/*"
            onChange={handleUpload}
          />
        </div>

        {/* STORIES */}
        {activeStories.map((story) => {
          const media =
            story.media?.[0];

          const storyUser =
            story.user || {};

          return (
            <div
              key={story._id}
              onClick={() =>
                setSelectedStory(story)
              }
              onDoubleClick={() =>
                handleLikeStory(story)
              }
              className="relative min-w-[110px] h-44 rounded-2xl overflow-hidden cursor-pointer shadow-xl bg-black"
            >
              {/* IMAGE */}
              {media?.type ===
                "image" && (
                <img
                  src={media.url}
                  className="w-full h-full object-cover"
                />
              )}

              {/* VIDEO */}
              {media?.type ===
                "video" && (
                <video
                  src={media.url}
                  className="w-full h-full object-cover"
                  muted
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

              {/* User */}
              <div className="absolute top-2 left-2 flex items-center gap-2">
                <img
                  src={
                    storyUser.profilePic ||
                    "/default-avatar.png"
                  }
                  className="w-10 h-10 rounded-full border-2 border-pink-500 object-cover"
                />

                <span className="text-white text-xs font-semibold">
                  {storyUser.name ||
                    "Unknown"}
                </span>
              </div>

              {/* Likes */}
              <div className="absolute bottom-2 left-2 text-white text-xs">
                ❤️{" "}
                {storiesLikes[
                  story._id
                ] ??
                  story.likes?.length ??
                  0}
              </div>

              {/* Heart animation */}
              {heartAnim[story._id] && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl animate-ping">
                    ❤️
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* STORY VIEWER */}
      {selectedStory && (
        <div
          className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
          onClick={() =>
            setSelectedStory(null)
          }
        >
          {selectedStory.media?.[0]
            ?.type === "image" ? (
            <img
              src={
                selectedStory.media[0]
                  ?.url
              }
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <video
              src={
                selectedStory.media[0]
                  ?.url
              }
              controls
              autoPlay
              className="max-h-full max-w-full"
            />
          )}
        </div>
      )}
    </>
  );
};

export default StoriesBar;