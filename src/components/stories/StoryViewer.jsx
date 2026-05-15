import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { API_BASE } from "../../api/api";

const StoryViewer = ({
  story,
  onClose,
  onLike,
  onShare,
}) => {
  const videoRef = useRef();

  const [paused, setPaused] =
    useState(false);

  useEffect(() => {
    if (
      videoRef.current &&
      !paused
    ) {
      videoRef.current.play();
    }
  }, [paused]);

  useEffect(() => {
    if (!story?._id) return;

    const token =
      localStorage.getItem("token");

    fetch(
      `${API_BASE}/api/stories/view/${story._id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ).catch(console.error);
  }, [story]);

  if (!story) return null;

  const media = story.media?.[0];

  return (
    <div
      className="
        fixed
        inset-0
        bg-black
        z-[999]
        flex
        items-center
        justify-center
      "
    >
      {/* CLOSE */}
      <button
        onClick={onClose}
        className="
          absolute
          top-5
          right-5
          text-white
          text-3xl
          z-50
        "
      >
        ✕
      </button>

      {/* MEDIA */}
      {media?.type === "image" ? (
        <img
          src={media.url}
          alt=""
          className="w-full h-full object-contain"
        />
      ) : (
        <video
          ref={videoRef}
          src={media?.url}
          className="w-full h-full object-contain"
          autoPlay
          playsInline
          controls={false}
          loop
          onClick={() =>
            setPaused(!paused)
          }
        />
      )}

      {/* TOP */}
      <div
        className="
          absolute
          top-0
          left-0
          right-0
          p-4
          flex
          items-center
          gap-3
          bg-gradient-to-b
          from-black/60
          to-transparent
        "
      >
        <img
          src={
            story.user?.profilePic ||
            "/default-avatar.png"
          }
          className="
            w-10
            h-10
            rounded-full
            object-cover
          "
        />

        <div>
          <p className="text-white font-semibold">
            {story.user?.name}
          </p>

          <p className="text-xs text-gray-300">
            Story
          </p>
        </div>
      </div>

      {/* BOTTOM ACTIONS */}
      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          p-5
          flex
          justify-between
          items-center
          bg-gradient-to-t
          from-black/70
          to-transparent
        "
      >
        <div className="text-white">
          {story.caption}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() =>
              onLike(story)
            }
            className="text-white text-2xl"
          >
            ❤️
          </button>

          <button
            onClick={() =>
              onShare(story)
            }
            className="text-white text-2xl"
          >
            📤
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;