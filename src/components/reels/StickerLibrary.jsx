import { useMemo, useState } from "react";
import useStickerManifest from "../stickers/useStickerManifest";

const CATEGORY_NAMES = {
  faces: "Faces",
  people: "People",
  hands: "Hands",
  hearts: "Hearts",
  reactions: "Reactions",
  celebration: "Celebration",
  animals: "Animals",
  africa: "Africa",
  business: "Business",
  food: "Food",
  music: "Music",
  sports: "Sports",
  travel: "Travel",
  objects: "Objects",
  flags: "Flags",
  symbols: "Symbols",
};

export default function StickerLibrary({ onSelect }) {
  const { manifest, loading } = useStickerManifest();
  const [activeCategory, setActiveCategory] = useState("faces");
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () =>
      Object.entries(manifest)
        .filter(([, files]) => Array.isArray(files) && files.length > 0)
        .map(([key, files]) => ({
          key,
          name: CATEGORY_NAMES[key] || key,
          count: files.length,
        })),
    [manifest]
  );

  const stickers = useMemo(() => {
    const query = search.trim().toLowerCase();

    // Searching covers every category, not just the selected category.
    const source = query
      ? Object.entries(manifest).flatMap(([category, files]) =>
          (Array.isArray(files) ? files : []).map((file) => ({
            category,
            file,
          }))
        )
      : (manifest[activeCategory] || []).map((file) => ({
          category: activeCategory,
          file,
        }));

    return source
      .filter(({ file, category }) => {
        if (!query) return true;

        return (
          file.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query) ||
          (CATEGORY_NAMES[category] || category)
            .toLowerCase()
            .includes(query)
        );
      })
      .map(({ category, file }) => ({
        id: `${category}/${file}`,
        name: file
          .replace(/\.webp$/i, "")
          .replace(/^emoji_/, ""),
        url: `/stickers/${category}/${file}`,
        category,
      }));
  }, [manifest, activeCategory, search]);

  if (loading) {
    return (
      <div className="py-6 text-center text-sm text-white/70">
        Loading stickers...
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="py-6 text-center text-sm text-white/70">
        Stickers could not be loaded. Please try again.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-3 text-white">
      {/* Search stays above the scrolling sticker grid. */}
      <div className="shrink-0">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search all stickers..."
          aria-label="Search stickers"
          className="box-border w-full rounded-lg border border-white/20 bg-zinc-900 px-3 py-3 text-base text-white placeholder:text-white/50 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Categories have their own horizontal scrolling row. */}
      <div
        className="shrink-0 overflow-x-auto overscroll-x-contain"
        aria-label="Sticker categories"
      >
        <div className="flex w-max min-w-full gap-2 pb-2">
          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => {
                setActiveCategory(category.key);
                setSearch("");
              }}
              aria-pressed={activeCategory === category.key && !search}
              className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium ${
                activeCategory === category.key && !search
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {search.trim() && (
        <p className="shrink-0 text-xs text-white/60">
          {stickers.length} matching sticker(s)
        </p>
      )}

      {/* Only the sticker grid scrolls vertically. */}
      <div className="grid min-h-0 max-h-64 grid-cols-4 gap-2 overflow-x-hidden overflow-y-auto overscroll-contain rounded-lg">
        {stickers.map((sticker) => (
          <button
            key={sticker.id}
            type="button"
            onClick={() => onSelect(sticker)}
            title={sticker.name}
            aria-label={`Add sticker ${sticker.name}`}
            className="flex min-h-16 items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/15 active:bg-blue-600/40"
          >
            <img
              src={sticker.url}
              alt={sticker.name}
              loading="lazy"
              draggable={false}
              className="h-12 w-12 object-contain"
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden";
              }}
            />
          </button>
        ))}

        {!stickers.length && (
          <p className="col-span-4 py-6 text-center text-sm text-white/60">
            No stickers found.
          </p>
        )}
      </div>
    </div>
  );
}