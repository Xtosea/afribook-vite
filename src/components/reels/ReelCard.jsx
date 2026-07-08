import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ReelCard = ({
  reel,
  index,
  activeIndex,
  reelRef,
  recordView,
  likeReel,
  shareReel,
  likes,
  shares,
}) => {
  const navigate = useNavigate();
  const localRef = useRef(null);
  const videoRef = reelRef || localRef;

  const [showHeart, setShowHeart] = useState(false);

  const isActive = index === activeIndex;

  const handleDoubleTap = () => {
    setShowHeart(true);
    likeReel(reel._id);

    setTimeout(() => setShowHeart(false), 800);
  };

  return (
    <div
      className="
        h-screen
        w-full
        snap-start
        bg-black
        relative
        flex
        items-center
        justify-center
      "
      onDoubleClick={handleDoubleTap}
    >

      {/* 🔥 9:16 VIDEO CONTAINER */}
      <div className="relative h-full w-full max-w-[420px] mx-auto">

        <video
          ref={videoRef}
          data-index={index}
          src={reel.media?.[0]?.url}
          className="h-full w-full object-cover"
          playsInline
          muted
          loop
          preload="metadata"
          autoPlay={isActive}
          onPlay={() => recordView(reel._id)}
        />

        {/* HEART */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center text-6xl animate-ping">
            ❤️
          </div>
        )}

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end pb-28 px-4">

          <p className="text-white text-sm mb-4">
            {reel.content || "No caption"}
          </p>

          <div className="flex justify-between text-white">

            <button onClick={() => likeReel(reel._id)}>
              ❤️ {likes[reel._id] || 0}
            </button>

            <button onClick={() => shareReel(reel._id)}>
              🔗 {shares[reel._id] || 0}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ReelCard;