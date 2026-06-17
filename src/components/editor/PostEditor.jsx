import React from "react";
import Draggable from "react-draggable";

const PostEditor = ({
  preview,
  media,
  text,
  textPosition,
  setTextPosition,
  textColor,
  textRotation,
  size,
  stickers,
  setStickers,
  selectedSticker,
  setSelectedSticker,
  backgroundColor,
  music,
}) => {
  return (
    <div
      className="
        relative
        w-full
        h-[70vh]
        rounded-xl
        overflow-hidden
        bg-black
      "
      style={{ backgroundColor }}
    >
      {/* IMAGE */}
      {preview &&
        media?.type?.startsWith("image") && (
          <img
            src={preview}
            alt=""
            className="
              absolute
              inset-0
              w-full
              h-full
              object-cover
            "
          />
        )}

      {/* VIDEO */}
      {preview &&
        media?.type?.startsWith("video") && (
          <video
            src={preview}
            controls
            className="
              absolute
              inset-0
              w-full
              h-full
              object-cover
            "
          />
        )}

      {/* MUSIC LABEL */}
      {music && (
        <div
          className="
            absolute
            top-3
            left-3
            bg-black/70
            text-white
            px-3
            py-1
            rounded-full
            z-50
          "
        >
          🎵 {music.title || "Music"}
        </div>
      )}

      {/* STICKERS */}
      {stickers.map((sticker, index) => (
        <Draggable
          key={index}
          position={{
            x: sticker.x,
            y: sticker.y,
          }}
          onStop={(e, data) => {
            const updated = [...stickers];

            updated[index] = {
              ...updated[index],
              x: data.x,
              y: data.y,
            };

            setStickers(updated);
          }}
        >
          <div
            onMouseDown={() =>
              setSelectedSticker(index)
            }
            onTouchStart={() =>
              setSelectedSticker(index)
            }
            className="
              absolute
              cursor-move
              select-none
            "
            style={{
              fontSize: `${sticker.size}px`,
              border:
                selectedSticker === index
                  ? "2px solid white"
                  : "none",
              borderRadius: "8px",
            }}
          >
            {sticker.emoji}
          </div>
        </Draggable>
      ))}

      {/* DRAGGABLE TEXT */}
      {text && (
        <Draggable
          position={textPosition}
          onStop={(e, data) =>
            setTextPosition({
              x: data.x,
              y: data.y,
            })
          }
        >
          <div>
            <div
              className="
                font-bold
                select-none
              "
              style={{
                fontSize: `${size}px`,
                color: textColor,
                transform: `rotate(${textRotation}deg)`,
                textShadow:
                  "0 2px 6px rgba(0,0,0,0.8)",
              }}
            >
              {text}
            </div>
          </div>
        </Draggable>
      )}
    </div>
  );
};

export default PostEditor;