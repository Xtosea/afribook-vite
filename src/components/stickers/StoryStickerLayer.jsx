import React from "react";
import StorySticker from "./StorySticker";

export default function StoryStickerLayer({
  stickers,
  updateSticker,
  removeSticker,
}) {
  return (
    <>
      {stickers.map((sticker) => (
        <StorySticker
          key={sticker.id}
          sticker={sticker}
          onUpdate={updateSticker}
          onRemove={removeSticker}
        />
      ))}
    </>
  );
}