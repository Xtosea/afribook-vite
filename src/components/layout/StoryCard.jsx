import React from "react";

const StoryCard = ({
  story,
  viewed,
  onOpen,
}) => {
  const media = story.media?.[0];

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
      {media?.type === "image" ? (
        <img
          src={media.url}
          alt=""
          className="w-full h-full object-cover"
        />
      ) : (
        <video
          src={media?.url}
          className="w-full h-full object-cover"
          muted
          playsInline
        />
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
          img
            src={
  safeUser.profilePic
    ? safeUser.profilePic.startsWith(
        "http"
      )
      ? safeUser.profilePic
      : `${API_BASE}${safeUser.profilePic}`
    : "/default-avatar.png"
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

      {/* USERNAME */}
      <div className="absolute bottom-3 left-3 right-3">
        <p className="text-white text-sm font-semibold truncate">
          {story.user?.name || "Unknown"}
        </p>
      </div>
    </div>
  );
};

export default StoryCard;

