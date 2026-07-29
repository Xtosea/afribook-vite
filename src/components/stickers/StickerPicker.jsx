import React, { useMemo, useState } from "react";
import useStickerManifest from "./useStickerManifest";
import StickerTabs from "./StickerTabs";
import StickerSearch from "./StickerSearch";
import StickerGrid from "./StickerGrid";
import "./sticker.css";

export default function StickerPicker({ onSelect }) {
  const { manifest, loading } = useStickerManifest();

  const categories = Object.keys(manifest);

  const [active, setActive] = useState("faces");
  const [search, setSearch] = useState("");

  const stickers = useMemo(() => {
    const list = manifest[active] || [];

    if (!search.trim()) return list;

    return list.filter((file) =>
      file.toLowerCase().includes(search.toLowerCase())
    );
  }, [manifest, active, search]);

  if (loading) {
    return <div className="sticker-loading">Loading stickers...</div>;
  }

  return (
    <div className="sticker-picker">

      <StickerSearch
        value={search}
        onChange={setSearch}
      />

      <StickerTabs
        categories={categories}
        active={active}
        onSelect={setActive}
      />

      <StickerGrid
        category={active}
        stickers={stickers}
        onSelect={onSelect}
      />

    </div>
  );
}
