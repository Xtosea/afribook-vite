import stickers from "../../data/stickers";

export default function StickerLibrary({ onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-3 max-h-72 overflow-y-auto">
      {stickers.map((sticker) => (
        <button
          key={sticker.id}
          onClick={() => onSelect(sticker)}
          className="p-2 rounded-lg hover:bg-zinc-800"
        >
          <img
            src={sticker.url}
            alt={sticker.name}
            className="w-16 h-16 object-contain"
          />
        </button>
      ))}
    </div>
  );
}