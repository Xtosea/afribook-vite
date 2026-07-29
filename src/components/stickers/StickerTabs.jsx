const labels = {
  faces: "😀",
  people: "🧑",
  hands: "👍",
  hearts: "❤️",
  reactions: "💥",
  celebration: "🎉",
  animals: "🦁",
  africa: "🌍",
  business: "💼",
  food: "🍕",
  music: "🎵",
  sports: "⚽",
  travel: "✈️",
  objects: "📦",
  flags: "🏳️",
  symbols: "⭐"
};

export default function StickerTabs({
  categories,
  active,
  onSelect
}) {
  return (
    <div className="sticker-tabs">
      {categories.map((cat) => (
        <button
          key={cat}
          className={active === cat ? "active" : ""}
          onClick={() => onSelect(cat)}
        >
          {labels[cat] || "🙂"}
        </button>
      ))}
    </div>
  );
}