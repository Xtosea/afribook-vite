import Draggable from "react-draggable";

export default function StorySticker({
  sticker,
  onUpdate,
  onRemove,
}) {
  return (
    <Draggable
      defaultPosition={{
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
        style={{
          position: "absolute",
          cursor: "move",
          zIndex: 20,
        }}
      >
        <img
          src={sticker.src}
          alt=""
          draggable={false}
          style={{
            width: sticker.width,
            transform: `rotate(${sticker.rotation}deg)`,
            userSelect: "none",
          }}
        />

        <button
          onClick={() => onRemove(sticker.id)}
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "none",
            background: "#ff3b30",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
    </Draggable>
  );
}