import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";

const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, value));

function ReelStickerItem({ sticker, width, height, onUpdate, onRemove }) {
  const nodeRef = useRef(null);

  const x = (Number(sticker.x ?? 500) / 1000) * width;
  const y = (Number(sticker.y ?? 500) / 1000) * height;

  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent"
      position={{ x, y }}
      onStop={(_, data) =>
        onUpdate?.(sticker.id, {
          x: Math.round(clamp(data.x / width, 0, 1) * 1000),
          y: Math.round(clamp(data.y / height, 0, 1) * 1000),
        })
      }
    >
      <div
        ref={nodeRef}
        className="absolute left-0 top-0 z-20"
        style={{ cursor: "move", touchAction: "none" }}
      >
        <div
          className="relative flex h-20 w-20 items-center justify-center"
          style={{
            transform: `translate(-50%, -50%) rotate(${sticker.rotation || 0}deg) scale(${sticker.scale || 1})`,
            transformOrigin: "center",
          }}
        >
          <img
            src={sticker.url}
            alt={sticker.name || "Reel sticker"}
            draggable={false}
            className="h-full w-full select-none object-contain"
          />

          <div className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/90 p-1 shadow-lg">
            <button
              type="button"
              aria-label="Delete sticker"
              onMouseDown={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
              onClick={() => onRemove?.(sticker.id)}
              className="rounded-full bg-red-600 px-2 py-1 text-xs text-white"
            >
              ✕
            </button>

            <button
              type="button"
              aria-label="Make sticker smaller"
              onMouseDown={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
              onClick={() =>
                onUpdate?.(sticker.id, {
                  scale: clamp((sticker.scale || 1) - 0.2, 0.4, 3),
                })
              }
              className="rounded-full bg-white/20 px-2 py-1 text-xs text-white"
            >
              −
            </button>

            <button
              type="button"
              aria-label="Make sticker larger"
              onMouseDown={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
              onClick={() =>
                onUpdate?.(sticker.id, {
                  scale: clamp((sticker.scale || 1) + 0.2, 0.4, 3),
                })
              }
              className="rounded-full bg-white/20 px-2 py-1 text-xs text-white"
            >
              +
            </button>

            <button
              type="button"
              aria-label="Rotate sticker"
              onMouseDown={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
              onClick={() =>
                onUpdate?.(sticker.id, {
                  rotation: ((sticker.rotation || 0) + 15) % 360,
                })
              }
              className="rounded-full bg-white/20 px-2 py-1 text-xs text-white"
            >
              ↻
            </button>
          </div>
        </div>
      </div>
    </Draggable>
  );
}

export default function ReelStickerEditor({
  stickers = [],
  onUpdate,
  onRemove,
  children,
}) {
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const observer = new ResizeObserver(([entry]) => {
      setStageSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const { width, height } = stageSize;

  return (
    <div
      ref={stageRef}
      className="relative mx-auto aspect-[9/16] w-full max-w-[240px] overflow-hidden rounded-xl border border-white/20 bg-black"
    >
      <div className="absolute inset-0">
        {children}
      </div>

      {width > 0 && height > 0 &&
        stickers.map((sticker) => (
          <ReelStickerItem
            key={sticker.id}
            sticker={sticker}
            width={width}
            height={height}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}
    </div>
  );
}