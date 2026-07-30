import React from "react";
import Draggable from "react-draggable";

export default function StoryStickerLayer({
  stickers,
  updateSticker,
  removeSticker,
}) {
  return (
    <>
      {stickers.map((sticker) => (
        <Draggable
          key={sticker.id}
          bounds="parent"
          position={{
            x: sticker.x,
            y: sticker.y,
          }}
          onStop={(e, data) =>
            updateSticker(sticker.id, {
              x: data.x,
              y: data.y,
            })
          }
        >
          <div
            className="absolute select-none"
            style={{
              transform: `
                rotate(${sticker.rotation || 0}deg)
                scale(${sticker.scale || 1})
              `,
            }}
          >
            <img
              src={sticker.url}
              alt=""
              draggable={false}
              className="w-20 h-20 object-contain pointer-events-none"
            />

            <button
              onClick={() => removeSticker(sticker.id)}
              className="
                absolute
                -top-3
                -right-3
                w-7
                h-7
                rounded-full
                bg-red-600
                text-white
                text-sm
                shadow-lg
              "
            >
              ✕
            </button>

            <button
              onClick={() =>
                updateSticker(sticker.id, {
                  scale: Math.max(
                    0.4,
                    (sticker.scale || 1) - 0.2
                  ),
                })
              }
              className="
                absolute
                -bottom-3
                left-0
                w-7
                h-7
                rounded-full
                bg-black/70
                text-white
              "
            >
              −
            </button>

            <button
              onClick={() =>
                updateSticker(sticker.id, {
                  scale: Math.min(
                    3,
                    (sticker.scale || 1) + 0.2
                  ),
                })
              }
              className="
                absolute
                -bottom-3
                right-0
                w-7
                h-7
                rounded-full
                bg-black/70
                text-white
              "
            >
              +
            </button>

            <button
              onClick={() =>
                updateSticker(sticker.id, {
                  rotation:
                    (sticker.rotation || 0) + 15,
                })
              }
              className="
                absolute
                top-1/2
                -left-8
                -translate-y-1/2
                w-7
                h-7
                rounded-full
                bg-blue-600
                text-white
              "
            >
              ↻
            </button>

            <button
              onClick={() =>
                updateSticker(sticker.id, {
                  rotation:
                    (sticker.rotation || 0) - 15,
                })
              }
              className="
                absolute
                top-1/2
                -right-8
                -translate-y-1/2
                w-7
                h-7
                rounded-full
                bg-blue-600
                text-white
              "
            >
              ↺
            </button>
          </div>
        </Draggable>
      ))}
    </>
  );
}