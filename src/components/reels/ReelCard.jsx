import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ReelCard = ({
  reel,
  index,
  activeIndex,
  reelRef,
  recordView,
  recordQualifyingWatch,
  likeReel,
  shareReel,
  likes,
  shares,
}) => {
  const navigate = useNavigate();
  const localRef = useRef(null);
  const videoRef = reelRef || localRef;

  const [showHeart, setShowHeart] = useState(false);

  const watchSessionIdRef = useRef(
    globalThis.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const watchedSecondsRef = useRef(0);
  const lastCurrentTimeRef = useRef(null);
  const qualifyingSentRef = useRef(false);

  const isActive = index === activeIndex;

  const handleWatchTimeUpdate = (event) => {
    if (qualifyingSentRef.current) return;

    const video = event.currentTarget;

    if (video.paused || video.ended) return;

    const currentTime = Number(video.currentTime);

    if (!Number.isFinite(currentTime) || currentTime < 0) {
      return;
    }

    const lastTime = lastCurrentTimeRef.current;

    if (lastTime !== null) {
      let delta = currentTime - lastTime;

      // Handle the video looping back to the beginning.
      if (delta < 0 && Number.isFinite(video.duration)) {
        delta = (video.duration - lastTime) + currentTime;
      }

      // Ignore unusually large jumps so seeking cannot add a large
      // amount of qualifying watch time in one update.
      if (delta >= 0 && delta <= 1.5) {
        watchedSecondsRef.current += delta;
      }
    }

    lastCurrentTimeRef.current = currentTime;

    const duration = Number(reel.durationSeconds);

    if (!Number.isFinite(duration) || duration <= 0) {
      return;
    }

    const requiredWatchSeconds = Math.max(
      3,
      Math.min(duration * 0.5, 10)
    );

    if (
      watchedSecondsRef.current >= requiredWatchSeconds
    ) {
      qualifyingSentRef.current = true;

      recordQualifyingWatch(
        reel._id,
        watchSessionIdRef.current,
        watchedSecondsRef.current
      );
    }
  };

  const handleVideoPlay = (event) => {
    lastCurrentTimeRef.current =
      Number(event.currentTarget.currentTime) || 0;

    recordView(reel._id);
  };

  const handleVideoPause = (event) => {
    lastCurrentTimeRef.current =
      Number(event.currentTarget.currentTime) || 0;
  };

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
      {/* VIDEO */}
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
          poster={reel.media?.[0]?.thumbnailUrl}
          onPlay={handleVideoPlay}
            onTimeUpdate={handleWatchTimeUpdate}
            onPause={handleVideoPause}
        />

        {/* Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* ❤️ Double-tap Heart */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center text-7xl animate-ping z-20">
            ❤️
          </div>
        )}

        {/* RIGHT ACTIONS */}
        <div
          className="
            absolute
            right-3
            bottom-28
            flex
            flex-col
            items-center
            gap-6
            text-white
            z-20
          "
        >
          <button
            onClick={() => likeReel(reel._id)}
            className="flex flex-col items-center"
          >
            <span className="text-3xl">❤️</span>
            <span className="text-xs">
              {likes[reel._id] || 0}
            </span>
          </button>

          <button
            onClick={() => navigate(`/post/${reel._id}`)}
            className="flex flex-col items-center"
          >
            <span className="text-3xl">💬</span>
            <span className="text-xs">
              {reel.comments?.length || 0}
            </span>
          </button>

          <button
            onClick={() => shareReel(reel._id)}
            className="flex flex-col items-center"
          >
            <span className="text-3xl">🔗</span>
            <span className="text-xs">
              {shares[reel._id] || 0}
            </span>
          </button>

          <div className="flex flex-col items-center">
            <span className="text-3xl">👁️</span>
            <span className="text-xs">
              {reel.viewsCount || 0}
            </span>
          </div>
        </div>

        {/* BOTTOM LEFT */}
        <div
          className="
            absolute
            bottom-8
            left-4
            right-20
            text-white
            z-20
          "
        >
          <h3 className="font-semibold text-base">
            @{reel.user?.name || "AfricSocial"}
          </h3>

          <p className="mt-2 text-sm whitespace-pre-wrap">
            {reel.content || "No caption"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReelCard;