import React, { useState, useRef, useEffect } from "react";
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
  const videoRef = localRef;
  const audioRef = useRef(null);

  const [showHeart, setShowHeart] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);

  const watchSessionIdRef = useRef(
    globalThis.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  const watchedSecondsRef = useRef(0);
  const lastCurrentTimeRef = useRef(null);
  const qualifyingSentRef = useRef(false);

  const isActive = index === activeIndex;
  const musicUrl = reel.music?.audioUrl;
  const hasMusic = Boolean(musicUrl);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!audio) return;

    if (!isActive || !hasMusic || !musicEnabled || !video || video.paused) {
      audio.pause();
      return;
    }

    const difference = Math.abs(audio.currentTime - video.currentTime);

    if (difference > 0.5 && Number.isFinite(video.currentTime)) {
      try {
        audio.currentTime = video.currentTime;
      } catch {
        // Audio metadata may not have loaded yet.
      }
    }

    audio.play().catch(() => setMusicEnabled(false));
  }, [isActive, hasMusic, musicUrl, musicEnabled]);

  const syncMusic = (video) => {
    const audio = audioRef.current;

    if (!audio || !hasMusic || !isActive || !musicEnabled) {
      audio?.pause();
      return;
    }

    if (Math.abs(audio.currentTime - video.currentTime) > 0.5) {
      try {
        audio.currentTime = video.currentTime;
      } catch {
        // Wait until audio metadata is available.
      }
    }

    if (video.paused) {
      audio.pause();
    } else {
      audio.play().catch(() => setMusicEnabled(false));
    }
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    const video = videoRef.current;

    if (!audio || !hasMusic) return;

    if (musicEnabled) {
      audio.pause();
      setMusicEnabled(false);
      return;
    }

    if (video && Number.isFinite(video.currentTime)) {
      try {
        audio.currentTime = video.currentTime;
      } catch {
        // Audio metadata may not have loaded yet.
      }
    }

    const playPromise = audio.play();
    setMusicEnabled(true);
    playPromise?.catch(() => setMusicEnabled(false));
  };

  const handleWatchTimeUpdate = (event) => {
    if (qualifyingSentRef.current) return;

    const video = event.currentTarget;
    syncMusic(video);

    if (video.paused || video.ended) return;

    const currentTime = Number(video.currentTime);

    if (!Number.isFinite(currentTime) || currentTime < 0) return;

    const lastTime = lastCurrentTimeRef.current;

    if (lastTime !== null) {
      let delta = currentTime - lastTime;

      if (delta < 0 && Number.isFinite(video.duration)) {
        delta = (video.duration - lastTime) + currentTime;
      }

      if (delta >= 0 && delta <= 1.5) {
        watchedSecondsRef.current += delta;
      }
    }

    lastCurrentTimeRef.current = currentTime;

    const duration = Number(reel.durationSeconds);

    if (!Number.isFinite(duration) || duration <= 0) return;

    const requiredWatchSeconds = Math.max(
      3,
      Math.min(duration * 0.5, 10)
    );

    if (watchedSecondsRef.current >= requiredWatchSeconds) {
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
    syncMusic(event.currentTarget);
  };

  const handleVideoPause = (event) => {
    lastCurrentTimeRef.current =
      Number(event.currentTarget.currentTime) || 0;

    audioRef.current?.pause();
  };

  const handleDoubleTap = () => {
    setShowHeart(true);
    likeReel(reel._id);

    setTimeout(() => setShowHeart(false), 800);
  };

  return (
    <div
      className="h-screen w-full snap-start bg-black relative flex items-center justify-center"
      onDoubleClick={handleDoubleTap}
    >
      <div className="relative h-full w-full max-w-[420px] mx-auto">
        <video
          ref={(element) => {
            localRef.current = element;
            if (typeof reelRef === "function") {
              reelRef(element);
            } else if (reelRef && typeof reelRef === "object") {
              reelRef.current = element;
            }
          }}
          data-index={index}
          data-has-music={hasMusic ? "true" : "false"}
          src={reel.media?.[0]?.url}
          className="h-full w-full object-cover"
          playsInline
          muted={hasMusic}
          loop
          preload="metadata"
          autoPlay={isActive}
          poster={reel.media?.[0]?.thumbnailUrl}
          onPlay={handleVideoPlay}
          onTimeUpdate={handleWatchTimeUpdate}
          onPause={handleVideoPause}
        />

        {hasMusic && (
          <audio
            ref={audioRef}
            src={musicUrl}
            preload="metadata"
            loop
          />
        )}

        {/* Published sticker overlays */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          {(Array.isArray(reel.stickers) ? reel.stickers : []).map(
            (sticker, stickerIndex) => {
              if (!sticker.url) return null;

              const x = Math.max(
                0,
                Math.min(1000, Number(sticker.x ?? 500))
              );

              const y = Math.max(
                0,
                Math.min(1000, Number(sticker.y ?? 500))
              );

              const scale = Math.max(
                0.4,
                Math.min(3, Number(sticker.scale ?? 1))
              );

              const rotation = Number(sticker.rotation ?? 0);

              return (
                <img
                  key={sticker._id || sticker.id || stickerIndex}
                  src={sticker.url}
                  alt={sticker.name || "Reel sticker"}
                  draggable={false}
                  className="absolute object-contain"
                  style={{
                    left: `${x / 10}%`,
                    top: `${y / 10}%`,
                    width: `${72 * scale}px`,
                    height: `${72 * scale}px`,
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  }}
                />
              );
            }
          )}
        </div>

        {/* Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Double-tap Heart */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center text-7xl animate-ping z-20 pointer-events-none">
            ❤️
          </div>
        )}

        {/* Right Actions */}
        <div className="absolute right-3 bottom-28 flex flex-col items-center gap-6 text-white z-20">
          {hasMusic && (
            <button
              type="button"
              onClick={toggleMusic}
              aria-label={musicEnabled ? "Turn Reel music off" : "Turn Reel music on"}
              title={musicEnabled ? "Turn music off" : "Turn music on"}
              className="flex flex-col items-center"
            >
              <span className="text-3xl">{musicEnabled ? "🔊" : "🔇"}</span>
              <span className="text-xs">Music</span>
            </button>
          )}

          <button
            onClick={() => likeReel(reel._id)}
            className="flex flex-col items-center"
          >
            <span className="text-3xl">❤️</span>
            <span className="text-xs">{likes[reel._id] || 0}</span>
          </button>

          <button
            onClick={() => navigate(`/post/${reel._id}`)}
            className="flex flex-col items-center"
          >
            <span className="text-3xl">💬</span>
            <span className="text-xs">{reel.comments?.length || 0}</span>
          </button>

          <button
            onClick={() => shareReel(reel._id)}
            className="flex flex-col items-center"
          >
            <span className="text-3xl">🔗</span>
            <span className="text-xs">{shares[reel._id] || 0}</span>
          </button>

          <div className="flex flex-col items-center">
            <span className="text-3xl">👁️</span>
            <span className="text-xs">{reel.viewsCount || 0}</span>
          </div>
        </div>

        {/* Bottom Left */}
        <div className="absolute bottom-8 left-4 right-20 text-white z-20">
          <h3 className="font-semibold text-base">
            @{reel.user?.name || "AfricSocial"}
          </h3>

          <p className="mt-2 text-sm whitespace-pre-wrap">
            {reel.content || "No caption"}
          </p>

          {hasMusic && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span>♫</span>
              <span className="truncate">
                {reel.music.title || "Original Reel music"}
                {reel.music.artist ? ` · ${reel.music.artist}` : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReelCard;