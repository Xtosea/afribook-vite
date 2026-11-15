import React from "react";

const MusicLibrary = ({ songs = [], onSelect, selectedSong }) => {
  const tracks = Array.isArray(songs) ? songs : [];

  if (!tracks.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center text-sm text-white/60">
        No music tracks are available yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tracks.map((song) => {
        const playableUrl =
          typeof song.audioUrl === "string" &&
          song.audioUrl.startsWith("https://") &&
          !song.audioUrl.includes("your-domain.com");

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
            <button
              type="button"
              onClick={() => onSelect(song)}
              aria-pressed={isSelected}
              className="flex w-full items-center gap-3 text-left"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                🎵
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-white">
                  {song.title || "Untitled track"}
                </span>
                <span className="block truncate text-sm text-white/60">
                  {song.artist || "Unknown artist"}
                </span>
              </span>

              <span className="shrink-0 text-sm text-blue-400">
                {isSelected ? "Selected" : "Select"}
              </span>
            </button>

            {playableUrl ? (
              <audio
                controls
                preload="none"
                src={song.audioUrl}
                className="mt-3 w-full"
              />
            ) : (
              <p className="mt-2 text-xs text-amber-300/80">
                Audio preview is not available yet.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MusicLibrary;