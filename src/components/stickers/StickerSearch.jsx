export default function StickerSearch({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search stickers..."
      className="sticker-search"
    />
  );
}