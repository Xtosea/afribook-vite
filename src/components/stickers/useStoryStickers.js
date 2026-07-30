import { useState } from "react";

export default function useStoryStickers() {
  const [stickers, setStickers] = useState([]);



  function addSticker(url) {
  setStickers((prev) => [
    ...prev,
    {
      id: Date.now(),
      url,
      x: 120,
      y: 120,
      scale: 1,
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