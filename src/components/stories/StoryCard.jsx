import React from "react";

const StoryCard = ({
  story,
  viewed,
  onOpen,
}) => {
  const media = story?.media?.[0];

  return (
    <div
      onClick={() => onOpen(story)}
      className="
        relative
        min-w-[110px]
        h-[190px]
        rounded-2xl
        overflow-hidden
        cursor-pointer
        snap-start
        shadow-lg
        bg-black
      "
    >
      {/* MEDIA */}
      {media?.type === "image" && (
        <img
          src={media.url}
          alt=""
          className="w-full h-full object-cover"
        />
      )}

      {media?.type === "video" && (
        <video
          src={media.url}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
      )}

      {media?.type === "audio" && (
        <div
          className="
            w-full
            h-full
            flex
            items-center
            justify-center
            bg-gradient-to-br
            from-purple-900
            via-black
            to-blue-900
          "
        >
          <div className="text-center text-white">
            <div className="text-5xl">
              🎵
            </div>

            <p className="text-xs mt-2">
              Audio Story
            </p>
          </div>
        </div>
      )}

      {!media && (
        <div
          className="
            w-full
            h-full
            flex
            items-center
            justify-center
            bg-gray-900
            text-white
          "
        >
          No Media
        </div>
      )}

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

      {/* PROFILE */}
      <div className="absolute top-3 left-3">
        <div
          className={`
            p-[2px]
            rounded-full
            ${
              viewed
                ? "bg-gray-400"
                : "bg-gradient-to-tr from-pink-500 via-yellow-400 to-purple-500"
            }
          `}
        >
          <img
            src={
              story?.user?.profilePic ||
              "/default-avatar.png"
            }
            alt=""
            className="
              w-12
              h-12
              rounded-full
              object-cover
              border-2
              border-black
            "
          />
        </div>
      </div>

      {/* MUSIC ICON */}
      {story?.music && (
        <div className="absolute top-2 right-2 text-lg">
          🎵
        </div>
      )}

      {/* TEXT ICON */}
      {story?.text && (
        <div className="absolute bottom-10 left-2 text-lg">
          ✍️
        </div>
      )}

      {/* USERNAME */}
      <div className="absolute bottom-3 left-3 right-3">
        <p className="text-white text-sm font-semibold truncate">
          {story?.user?.name || "Unknown"}
        </p>
      </div>
    </div>
  );
};

export default StoryCard;