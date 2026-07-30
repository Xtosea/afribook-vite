import React, {
useRef,
useState,
useEffect,
} from "react";

import { API_BASE } from "../../api/api";
import Draggable from "react-draggable";
import { uploadToCloudinary }
from "../../utils/uploadToCloudinary";

import { uploadToR2 } from "../../utils/uploadToR2";
import { generateVideoThumbnail } from "../../utils/generateVideoThumbnail";
import StickerPicker from "../stickers/StickerPicker";
import StoryStickerLayer from "../stickers/StoryStickerLayer";
import useStoryStickers from "../stickers/useStoryStickers";
import StickerToolbar from "../stickers/StickerToolbar";






const emojiList = [
"🔥",
"❤️",
"😂",
"😎",
"🎉",
"💯",
];


const currentUser = JSON.parse(
  localStorage.getItem("user")
);

//console.log(currentUser);

const StoryCreator = ({ onClose, onSelectFile }) => {


const fileRef = useRef();
const audioRef = useRef();




const {
  stickers,
  addSticker,
  updateSticker,
  removeSticker,
} = useStoryStickers();


// ================= STATES =================

const [showStickerPicker, setShowStickerPicker] = useState(false);


const [media, setMedia] = useState(null);
const [preview, setPreview] = useState(null);

const [text, setText] = useState("");
const [music, setMusic] = useState(null);

const [musicList, setMusicList] = useState([]);

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


const [activeTool, setActiveTool] = useState(null);

const [cloudinaryUrl, setCloudinaryUrl] = useState(null);



// ================= HANDLE FILE =================
const handleFile = async (e) => {
  console.log("1. handleFile started");

  const file = e.target.files?.[0];

  console.log("2. File:", file);

  if (!file) return;

  setMedia(file);
  setPreview(URL.createObjectURL(file));

  console.log("3. Preview set");

  if (file.type.startsWith("image/")) {
    console.log("4. Starting Cloudinary upload");

    const result = await uploadToCloudinary(file);

const url =
  typeof result === "string"
    ? result
    : result.url;

setCloudinaryUrl(url);

console.log("5. Upload finished", url);
  }

  console.log("6. handleFile finished");
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
  let uploadedUrl = null;
  let videoUrl = null;
  let type = "text";

  // VIDEO STORY
  if (media?.type?.startsWith("video")) {
    type = "video";

    videoUrl = await uploadToR2(media);

    const thumbnail = await generateVideoThumbnail(media);
    const uploaded = await uploadToCloudinary(thumbnail);

    uploadedUrl =
      typeof uploaded === "string"
        ? uploaded
        : uploaded.url;
  }

  // IMAGE STORY
  else if (media?.type?.startsWith("image")) {
  type = "image";

  uploadedUrl = cloudinaryUrl || preview;
}

  // TEXT STORY
  else {
    type = "text";
  }

  await onSelectFile({
  file:
    type === "video"
      ? media
      : null,

  cloudinaryUrl:
    type === "image"
      ? uploadedUrl
      : null,

  text,

  textStyle: {
    x: textPosition.x,
    y: textPosition.y,
    fontSize: size,
    color: textColor,
    rotation: textRotation,
  },

  music,
  stickers,
  backgroundColor,
});

  onClose();
};
  // <-- THIS WAS MISSING

useEffect(() => {
  fetch(`${API_BASE}/api/story-music`)
    .then((res) => res.json())
    .then(setMusicList);
}, []);


const handlePickMedia = (type) => {
  if (!fileRef.current) return;

  switch (type) {
    case "image":
      fileRef.current.accept = "image/*";
      break;

    case "video":
      fileRef.current.accept = "video/*";
      break;

    case "audio":
      fileRef.current.accept = "audio/*";
      break;

    default:
      fileRef.current.accept = "image/*,video/*,audio/*";
  }

  fileRef.current.click();
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

{/* DRAGGABLE PREVIEW AREA */}
<div
  
  className="relative mb-3 h-[85vh] rounded-xl overflow-hidden bg-black"
  style={{ backgroundColor }}
>

{/* Media Preview */}





<button
  type="button"
  onClick={onClose}
  className="
    absolute
    top-3
    left-1/2
    -translate-x-1/2
    z-[200]
    text-white
    px-4
    py-2
    bg-black/60
    rounded-full
    shadow-lg
  "
>
  ✕
</button>

{/* TOP BAR */}

  <div
  className="
    absolute
    top-2
    left-1
    z-50
    flex
    items-center
    gap-2
    bg-black/40
    backdrop-blur-sm
    px-3
    py-2
    rounded-xl
  "
>
  <img
    src={
      currentUser?.profilePic ||
      "/default-avatar.png"
    }
    alt=""
    className="
      w-10
      h-10
      rounded-full
      object-cover
      border
      border-white
    "
  />

  <div>
    <p className="text-white font-semibold text-sm">
      {currentUser?.name}
    </p>

    <span
      className="
        text-xs
        text-white/80
      "
    >
      🌎 Public
    </span>
  </div>
</div>

    {music && (
      <span
        className="
          ml-2
          text-xs
          bg-green-600/80
          text-white
          px-2
          py-1
          rounded-full
          max-w-[140px]
          truncate
        "
      >
        🎵 {music.title}
      </span>
    )}


  {(preview ||
  text ||
  music ||
  stickers.length > 0 ||
  backgroundColor !== "#000000") && (
  <button
    onClick={handlePost}
    className="
      absolute
      top-3
      right-4
      z-[200]
      bg-blue-600
      text-white
      px-5
      py-2
      rounded-full
      font-semibold
      shadow-lg
    "
  >
    Post
  </button>
)}


{/* TOOLBAR */}

  <StickerToolbar
  media={media}
  activeTool={activeTool}
  setActiveTool={setActiveTool}
/>


    {/* PREVIEW */}

{/* IMAGE */}
{preview &&
  media?.type?.startsWith("image") && (
    <img
      src={preview}
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
    />
)}

{/* VIDEO */}
{preview &&
  media?.type?.startsWith("video") && (
    <video
      src={preview}
      controls
      className="absolute inset-0 w-full h-full object-cover"
    />
)}

{/* AUDIO */}
{preview &&
  media?.type?.startsWith("audio") && (
    <div className="absolute inset-0 flex items-center justify-center">
      <audio
        controls
        src={preview}
        className="w-[90%]"
      />
    </div>
)}


<StoryStickerLayer
  stickers={stickers}
  updateSticker={updateSticker}
  removeSticker={removeSticker}
/>

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

   {/* ACTIVE TOOLS */}

 {activeTool === "sticker" && (
  <div
    className="
      absolute
      bottom-0
      left-0
      right-0
      bg-black/90
      p-3
      z-50
      h-[45%]
      overflow-y-auto
    "
  >
    <StickerPicker
      onSelect={(src) => {
        addSticker(src);
        setActiveTool(null);
      }}
    />
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
onClick={() => applyAI("enhance")}
className="bg-blue-600 text-white p-2 rounded"
>
✨ Enhance
</button>

<button
onClick={() => applyAI("beauty")}
className="bg-pink-600 text-white p-2 rounded"
>
💄 Beauty
</button>

<button
onClick={() => applyAI("queen")}
className="bg-purple-600 text-white p-2 rounded"
>
👑 Queen
</button>

<button
onClick={() => applyAI("ceo")}
className="bg-gray-700 text-white p-2 rounded"
>
💼 CEO
</button>

<button
onClick={() => applyAI("gamer")}
className="bg-green-600 text-white p-2 rounded"
>
🎮 Gamer
</button>

<button
onClick={() => applyAI("afroglow")}
className="bg-orange-600 text-white p-2 rounded"
>
🌍 Afro Glow
</button>

<button
onClick={() => applyAI("naijavibes")}
className="bg-red-600 text-white p-2 rounded"
>
🔥 Naija Vibes
</button>

<button
onClick={() => applyAI("festival")}
className="bg-yellow-600 text-white p-2 rounded"
>
✨ Festival
</button>

<button
onClick={() => applyAI("studio")}
className="bg-slate-600 text-white p-2 rounded"
>
📸 Studio Portrait
</button>

<button
onClick={() => applyAI("goldenhour")}
className="bg-amber-600 text-white p-2 rounded"
>
🌅 Golden Hour
</button>

</div>
</div>


)}




{/* Text Overlay */}
{text && (
<Draggable
  bounds="parent"
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
</div>

{/* HIDDEN FILE INPUT */}  

<input
  ref={fileRef}
  type="file"
  accept="image/*,video/*,audio/*"
  hidden
  onChange={handleFile}
/>


</div>

);
};

export default StoryCreator;