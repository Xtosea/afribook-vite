import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ReelCard = ({
  reel,
  reelRef,
  recordView,
  likeReel,
  shareReel,
  likes,
  shares,
}) => {
  const navigate = useNavigate();

  const [showHeart, setShowHeart] = useState(false);
  const [buffering, setBuffering] = useState(true);

  // ================= DOUBLE TAP LIKE =================
  const handleDoubleTap = () => {
    setShowHeart(true);

    likeReel(reel._id);

    setTimeout(() => {
      setShowHeart(false);
    }, 800);
  };

  return (
    <div
      className="h-screen snap-start relative bg-black overflow-hidden"
      onDoubleClick={handleDoubleTap}
    >
      {/* VIDEO */}
      <video
        ref={reelRef}
        src={reel.media?.[0]?.url}
        className="h-full w-full object-cover"
        loop
        muted
        playsInline
        autoPlay
        onPlay={() => recordView(reel._id)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
      />

      {/* BUFFERING LOADER */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* BIG HEART ANIMATION */}
      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="text-7xl animate-ping">❤️</div>
        </div>
      )}

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-20">
        <div className="h-full flex flex-col justify-between p-4">
          {/* TOP USER INFO */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() =>
              reel.user?._id &&
              navigate(`/profile/${reel.user._id}`)
            }
          >
            <img
              src={
                reel.user?.profilePic ||
                "/default-avatar.png"
              }
              alt="profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-white"
            />

            <div>
              <h3 className="text-white font-semibold text-base">
                {reel.user?.name || "Unknown User"}
              </h3>

              <p className="text-gray-300 text-xs">
                Reel
              </p>
            </div>
          </div>

          {/* BOTTOM CONTENT */}
          <div className="flex justify-between items-end gap-4">
            {/* CAPTION */}
            <div className="max-w-[70%] text-white">
              <p className="bg-black/40 p-3 rounded-2xl backdrop-blur-sm text-sm leading-relaxed">
                {reel.content || "No caption"}
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col gap-6 text-white items-center">
              {/* LIKE */}
              <button
                onClick={() => likeReel(reel._id)}
                className="flex flex-col items-center active:scale-90 transition"
              >
                <span className="text-3xl">❤️</span>

                <span className="text-sm font-medium">
                  {likes[reel._id] || 0}
                </span>
              </button>

              {/* SHARE */}
              <button
                onClick={() => shareReel(reel._id)}
                className="flex flex-col items-center active:scale-90 transition"
              >
                <span className="text-3xl">🔗</span>

                <span className="text-sm font-medium">
                  {shares[reel._id] || 0}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelCard;