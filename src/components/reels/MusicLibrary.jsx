import React, { useEffect, useRef, useState } from "react";

const MusicLibrary = ({ songs = [], onSelect, selectedSong }) => {
  const tracks = Array.isArray(songs) ? songs : [];
  const audioRef = useRef(null);
  const [previewSong, setPreviewSong] = useState(null);

  const getPlayableUrl = (song) =>
    typeof song?.audioUrl === "string" &&
    song.audioUrl.startsWith("https://") &&
    !song.audioUrl.includes("your-domain.com")
      ? song.audioUrl
      : null;

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPreviewSong(null);
  };

  const playPreview = async (song) => {
    const url = getPlayableUrl(song);
    if (!url) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setPreviewSong(song);

    const audio = audioRef.current;
    if (!audio) return;

    audio.src = url;
    try {
      await audio.play();
    } catch (error) {
      console.error("Music preview failed:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  if (!tracks.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center text-sm text-white/60">
        No music tracks are available yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <audio
        ref={audioRef}
        preload="none"
      />

      {tracks.map((song) => {
        const playableUrl = getPlayableUrl(song);
        const isSelected = selectedSong?._id === song._id;

        return (
          <div
            key={song._id}
            className={`rounded-xl border p-3 ${
              isSelected
                ? "border-blue-500 bg-blue-500/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                🎵
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">
                  {song.title || "Untitled track"}
                </p>
                <p className="truncate text-sm text-white/60">
                  {song.artist || "Unknown artist"}
                </p>
              </div>

              {isSelected && (
                <span className="text-xs text-blue-400">Added</span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {playableUrl ? (
                <>
                  <button
                    type="button"
                    onClick={() => playPreview(song)}
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white"
                  >
                    Play
                  </button>

                  <button
                    type="button"
                    onClick={stopPreview}
                    disabled={!previewSong}
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-40"
                  >
                    Stop
                  </button>
                </>
              ) : (
                <span className="py-2 text-xs text-amber-300/80">
                  Audio preview unavailable
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  stopPreview();
                  onSelect?.(song);
                }}
                aria-pressed={isSelected}
                className={`ml-auto rounded-lg px-4 py-2 text-sm font-medium ${
                  isSelected
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-blue-600 text-white"
                }`}
              >
                {isSelected ? "Sent" : "Send"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MusicLibrary;