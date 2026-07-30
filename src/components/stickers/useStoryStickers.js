import { useState } from "react";

export default function useStoryStickers() {
  const [stickers, setStickers] = useState([]);

  function addSticker(src) {
    setStickers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        src,
        x: 120,
        y: 120,
        width: 90,
        rotation: 0,
      },
    ]);
  }

  function updateSticker(id, updates) {
    setStickers((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      )
    );
  }

  function removeSticker(id) {
    setStickers((prev) =>
      prev.filter((s) => s.id !== id)
    );
  }

  return {
    stickers,
    addSticker,
    updateSticker,
    removeSticker,
  };
}