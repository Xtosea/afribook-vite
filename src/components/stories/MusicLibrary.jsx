import React from "react";

const MusicLibrary = ({
  songs,
  onSelect,
}) => {
  return (
    <div>
      {songs.map((song) => (
        <button
          key={song._id}
          onClick={() => onSelect(song)}
        >
          🎵 {song.title}
        </button>
      ))}
    </div>
  );
};

export default MusicLibrary;