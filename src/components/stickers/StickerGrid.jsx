import React from "react";

export default function StickerGrid({
  stickers = [],
  category = "",
  onSelect,
}) {
  if (!stickers.length) {
    return (
      <div className="sticker-empty">
        No stickers found.
      </div>
    );
  }

  return (
    <div className="sticker-grid">
      {stickers.map((file) => (
        <button
          key={file}
          className="sticker-item"
          onClick={() =>
            onSelect(`/stickers/${category}/${file}`)
          }
        >
          <img
            src={`/stickers/${category}/${file}`}
            alt={file}
            loading="lazy"
            draggable="false"
          />
        </button>
      ))}
    </div>
  );
}