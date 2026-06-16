import React from "react";

const MusicLibrary = ({
  songs,
  onSelect,
}) => {
  return (
    <div className="space-y-3">
      {songs.map((song) => (
        <div
          key={song._id}
          className="border rounded p-2"
        >
          <button
            onClick={() => onSelect(song)}
            className="font-medium"
          >
            🎵 {song.title}
          </button>

          {song.audioUrl && (
            <audio
              controls
              src={song.audioUrl}
              className="w-full mt-2"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default MusicLibrary;