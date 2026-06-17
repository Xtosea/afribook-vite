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

  activeTool,
  setActiveTool,
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

      
{/* TOOLBAR */}
<div
  className="
    absolute
    top-4
    right-4
    z-50
    flex
    flex-col
    gap-3
  "
>
  <button
    onClick={() => setActiveTool("sticker")}
    className="w-12 h-12 rounded-full bg-black/60 text-white"
  >
    😀
  </button>

  <button
    onClick={() => setActiveTool("music")}
    className="w-12 h-12 rounded-full bg-black/60 text-white"
  >
    🎵
  </button>

  <button
    onClick={() => setActiveTool("color")}
    className="w-12 h-12 rounded-full bg-black/60 text-white"
  >
    🎨
  </button>

  <button
    onClick={() => setActiveTool("rotate")}
    className="w-12 h-12 rounded-full bg-black/60 text-white"
  >
    🔄
  </button>

  <button
    onClick={() => setActiveTool("size")}
    className="w-12 h-12 rounded-full bg-black/60 text-white"
  >
    📏
  </button>

  <button
    onClick={() => setActiveTool("background")}
    className="w-12 h-12 rounded-full bg-black/60 text-white"
  >
    🌈
  </button>
</div>

    {activeTool && (
  <div
    className="
      absolute
      bottom-0
      left-0
      right-0
      bg-black/80
      p-4
      z-50
    "
  >


{activeTool === "sticker" && (
  <div className="flex gap-3 flex-wrap">
    {["🔥","❤️","😂","😎","🎉","💯"].map(
      (emoji) => (
        <button
          key={emoji}
          className="text-3xl"
          onClick={() =>
            setStickers((prev) => [
              ...prev,
              {
                emoji,
                x: 100,
                y: 100,
                size: 60,
              },
            ])
          }
        >
          {emoji}
        </button>
      )
    )}
  </div>
)}


{activeTool === "music" && (
  <div className="space-y-2 max-h-40 overflow-y-auto">
    {musicList?.map((song) => (
      <button
        key={song._id}
        onClick={() => {
          setMusic(song);
          setActiveTool(null);
        }}
        className="
          block
          w-full
          text-left
          text-white
          p-2
          rounded
          bg-white/10
        "
      >
        🎵 {song.title}
      </button>
    ))}
  </div>
)}


{activeTool === "color" && (
  <input
    type="color"
    value={textColor}
    onChange={(e) =>
      setTextColor(e.target.value)
    }
  />
)}



{activeTool === "background" && (
  <input
    type="color"
    value={backgroundColor}
    onChange={(e) =>
      setBackgroundColor(
        e.target.value
      )
    }
  />
)}



{activeTool === "rotate" && (
  <input
    type="range"
    min="-180"
    max="180"
    value={textRotation}
    onChange={(e) =>
      setTextRotation(
        Number(e.target.value)
      )
    }
    className="w-full"
  />
)}



{activeTool === "size" && (
  <input
    type="range"
    min="20"
    max="150"
    value={size}
    onChange={(e) =>
      setSize(
        Number(e.target.value)
      )
    }
    className="w-full"
  />
)}

</div>
)}

    </div>
  );
};

export default PostEditor;