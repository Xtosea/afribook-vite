import Draggable from "react-draggable";

export default function StorySticker({
  sticker,
  onUpdate,
  onRemove,
}) {
  return (
    <Draggable
      bounds="parent"
      position={{
        x: sticker.x,
        y: sticker.y,
      }}
      onStop={(e, data) => {
        onUpdate(sticker.id, {
          x: data.x,
          y: data.y,
        });
      }}
    >
      <div
        className="absolute select-none"
        style={{
          transform: `rotate(${sticker.rotation || 0}deg) scale(${sticker.scale || 1})`,
          cursor: "move",
          zIndex: 20,
        }}
      >
        <img
          src={sticker.url}
          alt=""
          draggable={false}
          className="w-20 h-20 object-contain pointer-events-none"
        />

        <button
          onClick={() => onRemove(sticker.id)}
          className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-red-600 text-white"
        >
          ✕
        </button>

        <button
          onClick={() =>
            onUpdate(sticker.id, {
              scale: Math.max(0.4, (sticker.scale || 1) - 0.2),
            })
          }
          className="absolute -bottom-3 left-0 w-7 h-7 rounded-full bg-black/70 text-white"
        >
          −
        </button>

        <button
          onClick={() =>
            onUpdate(sticker.id, {
              scale: Math.min(3, (sticker.scale || 1) + 0.2),
            })
          }
          className="absolute -bottom-3 right-0 w-7 h-7 rounded-full bg-black/70 text-white"
        >
          +
        </button>

        <button
          onClick={() =>
            onUpdate(sticker.id, {
              rotation: (sticker.rotation || 0) + 15,
            })
          }
          className="absolute top-1/2 -left-8 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-600 text-white"
        >
          ↻
        </button>

        <button
          onClick={() =>
            onUpdate(sticker.id, {
              rotation: (sticker.rotation || 0) - 15,
            })
          }
          className="absolute top-1/2 -right-8 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-600 text-white"
        >
          ↺
        </button>
      </div>
    </Draggable>
  );
}