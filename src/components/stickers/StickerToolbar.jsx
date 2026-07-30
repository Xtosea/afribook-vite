export default function StickerToolbar({
  media,
  activeTool,
  setActiveTool,
  onPickMedia,
}) {
  const toolClass = `
    flex
    flex-col
    items-center
    justify-center
    w-16
    py-2
    rounded-xl
    bg-black/60
    text-white
    text-xs
    gap-1
  `;

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
        onClick={() => onPickMedia("image")}
        className={toolClass}
      >
        <span className="text-2xl">🖼️</span>
        <span>Image</span>
      </button>

      <button
        onClick={() => onPickMedia("video")}
        className={toolClass}
      >
        <span className="text-2xl">🎥</span>
        <span>Video</span>
      </button>

      <button
        onClick={() => onPickMedia("audio")}
        className={toolClass}
      >
        <span className="text-2xl">🎵</span>
        <span>Audio</span>
      </button>

      <hr className="border-white/30" />

      <button
        onClick={() => setActiveTool("text")}
        className={toolClass}
      >
        <span className="text-xl font-bold">Aa</span>
        <span>Text</span>
      </button>

      <button
        onClick={() => setActiveTool("sticker")}
        className={toolClass}
      >
        <span className="text-2xl">😀</span>
        <span>Sticker</span>
      </button>

      <button
        onClick={() => setActiveTool("music")}
        className={toolClass}
      >
        <span className="text-2xl">🎶</span>
        <span>Music</span>
      </button>

      <button
        onClick={() => setActiveTool("color")}
        className={toolClass}
      >
        <span className="text-2xl">🎨</span>
        <span>Color</span>
      </button>

      {media?.type?.startsWith("image") && (
        <button
          onClick={() => setActiveTool("ai")}
          className={toolClass}
        >
          <span className="text-2xl">🤖</span>
          <span>AI</span>
        </button>
      )}

      {activeTool && (
        <button
          onClick={() => setActiveTool(null)}
          className={`${toolClass} bg-red-600`}
        >
          <span className="text-2xl">❌</span>
          <span>Close</span>
        </button>
      )}
    </div>
  );
}