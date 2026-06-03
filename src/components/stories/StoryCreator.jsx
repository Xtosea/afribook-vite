import React, {
  useRef,
  useState,
  useEffect,
} from "react";

import { API_BASE } from "../../api/api";

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

      <div className="bg-white w-full max-w-md rounded-2xl p-4">

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
            ) : (
              <img
  src={preview}
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

  <div className="flex gap-2 flex-wrap">
    {emojiList.map((emoji) => (
      <button
        key={emoji}
        onClick={() =>
          setStickers((prev) => [
            ...prev,
            emoji,
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
            src={URL.createObjectURL(music)}
            className="w-full mb-3"
          />
        )}

        {/* MEDIA PICKER BUTTON */}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full bg-blue-600 text-white p-3 rounded-xl mb-3"
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
          accept="image/*,video/*"
          onChange={handleFile}
        />
      </div>
    </div>
  );
};

export default StoryCreator;