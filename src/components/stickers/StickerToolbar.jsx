export default function StickerToolbar({
  media,
  activeTool,
  setActiveTool,
}) {
  return (
    <div
      className="
        absolute
        top-20
        right-4
        z-[100]
        flex
        flex-col
        gap-3
        max-h-[70vh]
        overflow-y-auto
        pb-5
      "
    >
      <button
        onClick={() => setActiveTool("text")}
        className="bg-black/60 text-white p-2 rounded-xl"
      >
        Aa
      </button>

      <button
        onClick={() => setActiveTool("sticker")}
        className="bg-black/60 text-white p-2 rounded-xl"
      >
        😀
      </button>

      <button
        onClick={() => setActiveTool("music")}
        className="bg-black/60 text-white p-2 rounded-xl"
      >
        🎵
      </button>

      <button
        onClick={() => setActiveTool("color")}
        className="bg-black/60 text-white p-2 rounded-xl"
      >
        🎨
      </button>

      {media?.type?.startsWith("image") && (
        <button
          onClick={() => setActiveTool("ai")}
          className="bg-black/60 text-white p-2 rounded-xl"
        >
          🤖
        </button>
      )}

      {activeTool && (
        <button
          onClick={() => setActiveTool(null)}
          className="bg-red-600 text-white p-2 rounded-xl"
        >
          ❌
        </button>
      )}
    </div>
  );
}