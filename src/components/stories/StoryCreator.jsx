import React, {
useRef,
useState,
useEffect,
} from "react";

import { API_BASE } from "../../api/api";
import Draggable from "react-draggable";
import {
  useAIEffects,
} from "../../hooks/useAIEffects";


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
const audioRef = useRef();

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



const [size, setSize] = useState(60);
const [textColor, setTextColor] =
  useState("#ffffff");
const [textRotation, setTextRotation] =
  useState(0);
const [selectedSticker, setSelectedSticker] =
  useState(null);

const [activeTool, setActiveTool] = useState(null);

const {
  applyEffect,
} = useAIEffects();

const [aiLoading,
setAiLoading] =
useState(false);




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
  textSize: size,
  textColor,
  textRotation,
  music,
  stickers,
  backgroundColor,
});

onClose();
};

useEffect(() => {
  fetch(`${API_BASE}/api/story-music`)
    .then((res) => res.json())
    .then(setMusicList);
}, []);



const applyAI = async (
  effect
) => {
  try {

    if (!preview) return;

    setAiLoading(true);

    const newUrl =
      await applyEffect(
        preview,
        effect
      );

    setPreview(newUrl);

  } catch (err) {
    console.error(err);
  } finally {
    setAiLoading(false);
  }
};


// ================= UI =================
return (
<div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">

<div
  className="
    bg-white
    w-full
    h-full
    max-w-none
    rounded-none
    p-4
    overflow-y-auto "
>

{/* POST BUTTON */}  
    <button
  onClick={handlePost}
  className="fixed top-4 left-1/4 -translate-x-1/4 bg-black text-white px-4 py-3 rounded-xl shadow-lg z-50"
>
  Post Story
</button>


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

 

{/* DRAGGABLE PREVIEW AREA */}
{(preview || stickers.length > 0 || text) && (
  <div
    className="relative mb-3 h-[70vh] rounded-xl overflow-hidden bg-black"
    style={{ backgroundColor }}
  >
    {/* Media Preview */}



<div className="absolute top-3 right-3 flex flex-col gap-2 z-50">

  <button
    onClick={() => fileRef.current?.click()}
    className="bg-black/60 text-white p-2 rounded-full"
  >
    📷
  </button>

  <button
    onClick={() => setActiveTool("text")}
    className="bg-black/60 text-white p-2 rounded-full"
  >
    Aa
  </button>

  <button
    onClick={() => setActiveTool("sticker")}
    className="bg-black/60 text-white p-2 rounded-full"
  >
    😀
  </button>

  <button
    onClick={() => setActiveTool("music")}
    className="bg-black/60 text-white p-2 rounded-full"
  >
    🎵
  </button>

  <button
    onClick={() => setActiveTool("color")}
    className="bg-black/60 text-white p-2 rounded-full"
  >
    🎨
  </button>


<button
  onClick={() => setActiveTool(null)}
  className="absolute top-2 right-12 text-Red"
>
  ❌
</button>
</div>


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
          controls
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : media?.type?.startsWith("audio") ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <audio
            controls
            src={preview}
            className="w-[90%]"
          />
        </div>
      ) : null)}



       {/* TEXT TOOLS */}
{activeTool === "text" && (
  <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3 z-50">
    <input
      type="text"
      placeholder="Add text..."
      value={text}
      onChange={(e) => setText(e.target.value)}
      className="w-full p-2 rounded mb-2"
    />

    <input
      type="color"
      value={textColor}
      onChange={(e) =>
        setTextColor(e.target.value)
      }
    />

    <input
      type="range"
      min="20"
      max="120"
      value={size}
      onChange={(e) =>
        setSize(Number(e.target.value))
      }
      className="w-full"
    />

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

     <button
  onClick={() => setActiveTool(null)}
  className="
    mt-3
    bg-green-600
    text-white
    px-3
    py-2
    rounded
  "
>
  Done
</button>

  </div>
)}


<button
  onClick={() =>
    setActiveTool("ai")
  }
  className="
    bg-black/60
    text-white
    p-2
    rounded-full
  "
>
  🤖
</button>



{activeTool === "sticker" && (
  <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3 z-50">

    <div className="flex gap-3 flex-wrap">
      {emojiList.map((emoji) => (
        <button
          key={emoji}
          className="text-3xl"
          onClick={() => {
            const newSticker = {
              emoji,
              x: 100,
              y: 100,
              size: 60,
            };

            setStickers((prev) => [
              ...prev,
              newSticker,
            ]);

            setSelectedSticker(stickers.length);
          }}
        >
          {emoji}
        </button>
      ))}
    </div>

    {selectedSticker !== null && (
      <div className="mt-4">
        <p className="text-white mb-2">
          Sticker Size
        </p>

        <input
          type="range"
          min="30"
          max="200"
          value={
            stickers[selectedSticker]?.size || 60
          }
          onChange={(e) => {
            const updated = [...stickers];

            updated[selectedSticker] = {
              ...updated[selectedSticker],
              size: Number(e.target.value),
            };

            setStickers(updated);
          }}
          className="w-full"
        />

        <button
          onClick={() => setActiveTool(null)}
          className="mt-3 bg-green-600 text-white px-3 py-2 rounded"
        >
          Done
        </button>
      </div>
    )}

  </div>
)}


{activeTool === "music" && (
  <div
    className="
      absolute
      bottom-0
      left-0
      right-0
      bg-black/90
      p-3
      z-50
      h-[50%]
      overflow-y-auto
    "
  >
    {musicList.map((song) => (
      <div
        key={song._id}
        className="flex justify-between items-center border-b border-white/20 py-2"
      >
        <span className="text-white">
          {song.title}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setMusic(song);
              setActiveTool(null);
            }}
            className="bg-blue-600 text-white px-2 py-1 rounded"
          >
            Select
          </button>

          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.src =
                  song.audioUrl;
                audioRef.current.play();
              }
            }}
            className="bg-green-600 text-white px-2 py-1 rounded"
          >
            ▶
          </button>
        </div>
      </div>
    ))}
  </div>
)}


{activeTool === "color" && (
  <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3 z-50">
    <input
      type="color"
      value={backgroundColor}
      onChange={(e) => {
  setBackgroundColor(e.target.value);
  setActiveTool(null);
}}
    />
  </div>
)}


{music && (
  <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full z-40">
    🎵 {music.title || "Custom Music"}
  </div>
)}


{activeTool === "ai" && (
  <div
    className="
      absolute
      bottom-0
      left-0
      right-0
      bg-black/90
      p-3
      z-50
    "
  >
    <div className="grid grid-cols-2 gap-2">

      <button
        onClick={() =>
          applyAI("enhance")
        }
        className="bg-blue-600 text-white p-2 rounded"
      >
        ✨ Enhance
      </button>

      <button
        onClick={() =>
          applyAI("beauty")
        }
        className="bg-pink-600 text-white p-2 rounded"
      >
        💄 Beauty
      </button>

      <button
        onClick={() =>
          applyAI("queen")
        }
        className="bg-purple-600 text-white p-2 rounded"
      >
        👑 Queen
      </button>

      <button
        onClick={() =>
          applyAI("ceo")
        }
        className="bg-gray-700 text-white p-2 rounded"
      >
        💼 CEO
      </button>

      <button
        onClick={() =>
          applyAI("gamer")
        }
        className="bg-green-600 text-white p-2 rounded"
      >
        🎮 Gamer
      </button>

    </div>
  </div>
)}



    {/* Stickers */}
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
          className="absolute cursor-move select-none"
          style={{
            fontSize: `${sticker.size || 60}px`,
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

    {/* Text Overlay */}
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
      className="font-bold select-none"
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
)}


  {/* TEXT INPUT */}
<input
  type="text"
  placeholder="Add text to story..."
  value={text}
  onChange={(e) =>
    setText(e.target.value)
  }
  className="w-full p-2 border rounded mb-3"
/>

{/* TEXT COLOR */}
<div className="mb-3">
  <p className="font-semibold">
    Text Color
  </p>

  <input
    type="color"
    value={textColor}
    onChange={(e) =>
      setTextColor(e.target.value)
    }
  />
</div>

{/* TEXT SIZE */}
<div className="mb-3">
  <p className="font-semibold">
    Text Size
  </p>

  <input
    type="range"
    min="20"
    max="120"
    value={size}
    onChange={(e) =>
      setSize(Number(e.target.value))
    }
    className="w-full"
  />

  <p>{size}px</p>
</div>

{/* TEXT ROTATION */}
<div className="mb-3">
  <p className="font-semibold">
    Text Rotation
  </p>

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

  <p>{textRotation}°</p>
</div>


   {/* Stickers */}
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
  size: 60,
}
          ])
        }
        className="text-3xl"
      >
        {emoji}
      </button>
    ))}
  </div>
</div>


{selectedSticker !== null && (
  <div className="mb-3">
    <p className="font-semibold">
      Sticker Size
    </p>

    <input
      type="range"
      min="30"
      max="200"
      value={
        stickers[selectedSticker]?.size || 60
      }
      onChange={(e) => {
        const updated = [...stickers];

        updated[selectedSticker] = {
          ...updated[selectedSticker],
          size: Number(e.target.value),
        };

        setStickers(updated);
      }}
      className="w-full"
    />
  </div>
)}




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


<div className="mb-4">
  <h3 className="font-semibold mb-2">
    Music Library
  </h3>

  <div className="border rounded max-h-60 overflow-y-auto">
    {musicList.map((song) => (
  <div
    key={song._id}
    className="p-3 border-b"
  >
    <div className="font-medium mb-2">
      🎵 {song.title}
      {song.artist &&
        ` - ${song.artist}`}
    </div>

    <div className="flex gap-2">
      <button
        onClick={() => setMusic(song)}
        className="px-3 py-1 bg-blue-600 text-white rounded"
      >
        Select
      </button>

      <button
        onClick={() => {
          const audio =
            new Audio(song.audioUrl);
          audio.play();
        }}
        className="px-3 py-1 bg-green-600 text-white rounded"
      >
        ▶ Play
      </button>
    </div>
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
  <div className="mb-4 border rounded p-3">
    <p className="font-semibold mb-2">
      Selected Music
    </p>

    <audio
      ref={audioRef}
      src={
        music instanceof File
          ? URL.createObjectURL(music)
          : music.audioUrl
      }
    />

    <div className="flex gap-2">
      <button
        onClick={() =>
          audioRef.current?.play()
        }
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        ▶ Play
      </button>

      <button
        onClick={() =>
          audioRef.current?.pause()
        }
        className="px-4 py-2 bg-yellow-600 text-white rounded"
      >
        ⏸ Pause
      </button>

      <button
        onClick={() => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        ■ Stop
      </button>
    </div>
  </div>
)}


{/* MEDIA PICKER BUTTON */} 

    <button
  onClick={() => fileRef.current?.click()}
  className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-xl shadow-lg z-50"
>
  📷 Add Photo / Video
</button>
 
    

    {/* HIDDEN FILE INPUT */}  

    <input

type="file"
ref={fileRef}
className="hidden"
accept="video/*,image/*,audio/*"
onChange={handleFile}
/>

</div>
</div>
);
};

export default StoryCreator;
