import React, {
  useRef,
  useState,
  useEffect,
} from "react";

import { API_BASE } from "../../api/api";
import Draggable from "react-draggable";


const emojiList = [
  "🔥",
  "❤️",
  "😂",
  "😎",
  "🎉",
  "💯",
];


const StoryCreator = ({ onClose, onSelectFile }) => {
  const fileRef = useRef();

  // ================= STATES =================
  const [media, setMedia] = useState(null);
const [preview, setPreview] = useState(null);

const [text, setText] = useState("");
const [music, setMusic] = useState(null);

const [musicList, setMusicList] = useState([]);
const [stickers, setStickers] = useState([]);
const [backgroundColor, setBackgroundColor] =
  useState("#000000");
const [textPosition, setTextPosition] =
  useState({
    x: 50,
    y: 50,
  });


  // ================= HANDLE FILE =================
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMedia(file);
    setPreview(URL.createObjectURL(file));
  };

  // ================= POST STORY =================
const handlePost = async () => {
  if (
  !media &&
  !text &&
  !music &&
  stickers.length === 0
) {
  return;
}
  await onSelectFile({
  file: media,
  text,
  textPosition,
  music,
  stickers,
  backgroundColor,
});

  onClose();
};


useEffect(() => {
  fetch(
    `${API_BASE}/api/story-music`
  )
    .then((res) => res.json())
    .then(setMusicList);
}, []);


  // ================= UI =================
  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">

      <div className="bg-white w-screen max-w-md rounded-2xl p-4 max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">Create Story</h2>

          <button
            onClick={onClose}
            className="text-red-500 font-bold"
          >
            ✕
          </button>
        </div>

        {/* MEDIA PREVIEW */}
        {preview && (
          <div className="relative mb-3 rounded-xl overflow-hidden max-h-[300px] flex items-center justify-center bg-black">

            {media?.type?.startsWith("video") ? (
  <video
    src={preview}
    controls
    className="max-h-[300px] w-auto object-contain"
  />
) : media?.type?.startsWith("audio") ? (
  <audio
    controls
    src={preview}
    className="w-full"
  />
) : (
  <img
    src={preview}
    alt=""
    className="max-h-[300px] w-auto object-contain"
  />
)}

            {/* TEXT OVERLAY */}
            {text && (
              <div className="absolute bottom-4 left-4 right-4 text-white text-lg font-bold">
                {text}
              </div>
            )}
          </div>
        )}


       {/* DRAGGABLE PREVIEW AREA */}
{(preview || stickers.length > 0 || text) && (
  <div
    className="relative mb-3 h-[300px] rounded-xl overflow-hidden bg-black"
    style={{ backgroundColor }}
  >
    {preview &&
      (media?.type?.startsWith("image") ? (
        <img
          src={preview}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : media?.type?.startsWith("video") ? (
        <video
          src={preview}
          className="absolute inset-0 w-full h-full object-cover"
          muted
        />
      ) : null)}

    {/* DRAGGABLE STICKERS */}
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
        <div className="absolute text-4xl cursor-move">
          {sticker.emoji}
        </div>
      <Draggable
  position={textPosition}
  onStop={(e, data) =>
    setTextPosition({
      x: data.x,
      y: data.y,
    })
  }
>
   

    {/* DRAGGABLE TEXT */}
    {text && (
      <Draggable>
        <div className="absolute text-white text-2xl font-bold cursor-move">
          {text}
        </div>
      </Draggable>
    )}
  </div>
)}

);
        {/* TEXT INPUT */}
        <input
          type="text"
          placeholder="Add text to story..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />


<div className="mb-3">
  <p className="font-semibold">
    Stickers
  </p>


<div className="mb-3">
  <p className="font-semibold">
    Stickers
  </p>

  <div className="flex gap-2 flex-wrap">
    {emojiList.map((emoji) => (
      <button
        key={emoji}
        onClick={() =>
          setStickers((prev) => [
            ...prev,
            {
              emoji,
              x: 100,
              y: 100,
            },
          ])
        }
        className="text-3xl"
      >
        {emoji}
      </button>
    ))}
  </div>
</div>

  

<div className="mb-3">
  <p className="font-semibold">
    Background Color
  </p>

  <input
    type="color"
    value={backgroundColor}
    onChange={(e) =>
      setBackgroundColor(e.target.value)
    }
  />
</div>

         <div className="mb-3">
  <p className="font-semibold mb-2">
    Music Library
  </p>

  <div className="max-h-40 overflow-y-auto border rounded">
    {musicList.map((song) => (
      <div
        key={song._id}
        onClick={() => setMusic(song)}
        className="
          p-2
          border-b
          cursor-pointer
          hover:bg-gray-100
        "
      >
        🎵 {song.title}
        {song.artist && ` - ${song.artist}`}
      </div>
    ))}
  </div>
</div>

        {/* MUSIC INPUT */}
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setMusic(e.target.files[0])}
          className="w-full mb-3"
        />

        {music && (
  <audio
    controls
    src={
      music instanceof File
        ? URL.createObjectURL(music)
        : music.audioUrl
    }
    className="w-full mb-3"
  />
)}
            
        

        {/* MEDIA PICKER BUTTON */}
        <button
          onClick={() => fileRef.current?.click()}
          className="sticky bottom-0 w-full bg-blue-600 text-white p-3 rounded-xl mb-3"
        >
          📷 Add Photo / Video
        </button>

        {/* POST BUTTON */}
        <button
          onClick={handlePost}
          className="w-full bg-black text-white p-3 rounded-xl"
        >
          Post Story
        </button>

        {/* HIDDEN FILE INPUT */}

        <input
  type="file"
  ref={fileRef}
  className="hidden"
  accept="video/*,audio/*"
  onChange={handleFile}
/>
      </div>
    </div>
  );
};

export default StoryCreator;