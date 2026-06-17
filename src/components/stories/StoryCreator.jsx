import React, {
useRef,
useState,
useEffect,
} from "react";

import { API_BASE } from "../../api/api";
import Draggable from "react-draggable";
import { uploadToCloudinary }
from "../../utils/uploadToCloudinary";
import PostEditor from "../editor/PostEditor";




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

const [cloudinaryUrl, setCloudinaryUrl] = useState(null);



// ================= HANDLE FILE =================
const handleFile = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  setMedia(file);

  try {
    if (file.type.startsWith("image/")) {
      const url = await uploadToCloudinary(file);

      setCloudinaryUrl(url);
      setPreview(url);
    } else {
      // video/audio local preview
      setCloudinaryUrl(null);

      setPreview(
        URL.createObjectURL(file)
      );
    }
  } catch (error) {
    console.error(
      "IMAGE UPLOAD FAILED:",
      error
    );

    setPreview(null);
    setCloudinaryUrl(null);

    alert("Image upload failed");
  }

  // allow selecting same file again
  e.target.value = "";
};

// ================= APPLY AI =================
const applyAI = (effect) => {
  if (!cloudinaryUrl) {
    alert("Please select an image first");
    return;
  }

  let newUrl = cloudinaryUrl;

  switch (effect) {
    case "enhance":
      newUrl = cloudinaryUrl.replace(
        "/upload/",
        "/upload/e_enhance/"
      );
      break;

    case "beauty":
      newUrl = cloudinaryUrl.replace(
        "/upload/",
        "/upload/e_improve/"
      );
      break;

    case "queen":
      newUrl = cloudinaryUrl.replace(
        "/upload/",
        "/upload/e_improve/co_rgb:1f0933/"
      );
      break;

    case "ceo":
      newUrl = cloudinaryUrl.replace(
        "/upload/",
        "/upload/e_sharpen,e_improve/"
      );
      break;

    case "gamer":
      newUrl = cloudinaryUrl.replace(
        "/upload/",
        "/upload/e_vibrance:80,e_sharpen/"
      );
      break;

    case "afroglow":
      newUrl = cloudinaryUrl.replace(
        "/upload/",
        "/upload/e_vibrance:50,e_improve/"
      );
      break;

    case "naijavibes":
      newUrl = cloudinaryUrl.replace(
        "/upload/",
        "/upload/e_saturation:60,e_contrast:40/"
      );
      break;

    case "festival":
      newUrl = cloudinaryUrl.replace(
        "/upload/",
        "/upload/e_vibrance:100/"
      );
      break;

    case "studio":
      newUrl = cloudinaryUrl.replace(
        "/upload/",
        "/upload/e_sharpen,e_improve/"
      );
      break;

    case "goldenhour":
      newUrl = cloudinaryUrl.replace(
        "/upload/",
        "/upload/e_auto_brightness,e_auto_color/"
      );
      break;

    default:
      return;
  }

  setPreview(newUrl);
  setCloudinaryUrl(newUrl);
  
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
  cloudinaryUrl,
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
  className="fixed top-4 left-1/1 -translate-x-1/1 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg z-50"
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
<PostEditor
  preview={preview}
  media={media}
  text={text}
  textPosition={textPosition}
  setTextPosition={setTextPosition}
  textColor={textColor}
  textRotation={textRotation}
  size={size}
  stickers={stickers}
  setStickers={setStickers}
  selectedSticker={selectedSticker}
  setSelectedSticker={setSelectedSticker}
  backgroundColor={backgroundColor}
  music={music}
/>


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
  className="fixed bottom-20 right-4 bg-green-600 text-white p-2 rounded-xl shadow-lg z-50"
>
  📷 Add Photo/Video
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
