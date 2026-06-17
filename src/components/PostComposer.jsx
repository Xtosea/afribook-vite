import React, {
useState,
useEffect,
lazy,
Suspense,
} from "react";

import MediaUpload from "./MediaUpload";

import { API_BASE } from "../api/api";

import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";


import validateVideoDuration from "../utils/validateVideoDuration";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PostEditor from "./editor/PostEditor";



const PostComposer = () => {



const navigate = useNavigate();



const { token, currentUser } = useAuth();

const EmojiPicker = lazy(() =>
import("emoji-picker-react")
);



const emojiList = [
  "🔥",
  "❤️",
  "😂",
  "😎",
  "🎉",
  "💯",
];


const [showTextArea, setShowTextArea] = useState(false);
const [posting, setPosting] =
useState(false);

const [loading, setLoading] =
useState(false);

const [newPost, setNewPost] =
useState("");

const [mediaFiles, setMediaFiles] =
useState([]);


const [selectedFile, setSelectedFile] =
useState(null);

const [showEmoji, setShowEmoji] =
useState(false);

const [showLocation, setShowLocation] =
useState(false);

const [showCustomize, setShowCustomize] =
useState(false);

const [showFeeling, setShowFeeling] =
useState(false);

const [showTag, setShowTag] =
useState(false);

const [location, setLocation] =
useState("");

const [feeling, setFeeling] =
useState("");

const [tagInput, setTagInput] =
useState("");

const [taggedFriends, setTaggedFriends] =
useState([]);

const [
locationSuggestions,
setLocationSuggestions,
] = useState([]);

// =========================
// TEXT STYLE STATES
// =========================

const [textColor, setTextColor] =
useState("#000000");

const [backgroundStyle, setBackgroundStyle] =
useState("white");

const [fontStyle, setFontStyle] =
useState("font-sans");

// =========================
// CLOUDINARY
// =========================

const { uploadImage } =
useCloudinaryUpload();

// =========================
// R2 VIDEO
// =========================

const { uploadVideo } =
useR2Upload();

// =========================
// POSTEDITOR 
// =========================
const [stickers, setStickers] = useState([]);

const [selectedSticker, setSelectedSticker] =
  useState(null);

const [textPosition, setTextPosition] =
  useState({
    x: 50,
    y: 50,
  });

const [textRotation, setTextRotation] =
  useState(0);

const [size, setSize] = useState(60);

const [backgroundColor, setBackgroundColor] =
  useState("#000000");
const [activeTool, setActiveTool] =
  useState(null);
const [music, setMusic] = useState(null);
const [musicList, setMusicList] = useState([]);


// =========================
// TAG FRIENDS
// =========================

const handleTagFriends = (value) => {

setTagInput(value);  

setTaggedFriends(  
  value  
    .split(",")  
    .map((f) => f.trim())  
    .filter(Boolean)  
);

};

// =========================
// POSTEDITOR USE EFFECTS 
// =========================

useEffect(() => {
  fetch(`${API_BASE}/api/story-music`)
    .then((res) => res.json())
    .then(setMusicList)
    .catch(console.error);
}, []);


// =========================
// SUBMIT POST
// =========================



const handleSubmitPost = async (e) => {
console.log("HANDLE SUBMIT STARTED");

e.preventDefault();

if (!newPost && mediaFiles.length === 0) return;

setPosting(true);

try {
const uploadedMedia = [];
for (let file of mediaFiles) {
      if (file.enhanced && file.url) {
        uploadedMedia.push({
          url: file.url,
          type: "image",
        });
        continue;
      }


  const type = file.type?.startsWith("image") ? "image" : "video";  

  if (type === "image") {  
    const url = await uploadImage(file);  
    uploadedMedia.push({ url, type: "image" });  
    continue;  
  }  

  await validateVideoDuration(file, 180);  

  const { videoUrl, thumbnailBlob } = await uploadVideo(file);  

  const thumbnailFile = new File(  
    [thumbnailBlob],  
    "thumbnail.jpg",  
    { type: "image/jpeg" }  
  );  

  const thumbnailUrl = await uploadImage(thumbnailFile);  

  uploadedMedia.push({  
    url: videoUrl,  
    type: "video",  
    thumbnailUrl,  
  });  
}  

const res = await fetch(`${API_BASE}/api/posts`, {  
  method: "POST",  
  headers: {  
    Authorization: `Bearer ${token}`,  
    "Content-Type": "application/json",  
  },  
  body: JSON.stringify({
  content: newPost,
  media: uploadedMedia,

  editor: {
    textPosition,
    textRotation,
    textSize: size,
    textColor,
    backgroundColor,
    stickers,
  },

  location,
  feeling,
  taggedFriends,
  textColor,
  backgroundStyle,
  fontStyle,
}),
});  

const data = await res.json();  
console.log("POST RESPONSE:", data);  

if (!res.ok) throw new Error(data.error || "Post failed");  

// RESET (ONLY ONCE, INSIDE FUNCTION)  
setNewPost("");  
setMediaFiles([]);  
setSelectedFile(null);  
setLocation("");  
setFeeling("");  
setTagInput("");  
setTaggedFriends([]);  
setLocationSuggestions([]);  
 
setTextColor("#000000");  
setBackgroundStyle("white");  
setFontStyle("font-sans");  

navigate("/");

} catch (err) {
console.error("SUBMIT ERROR:", err);
alert(err.message || "Post failed");
} finally {
setPosting(false);
}
};

// =========================
// BACKGROUND STYLES
// =========================

const getBackgroundStyle = () => {

switch (backgroundStyle) {  

  case "gradient-purple":  
    return {  
      background:  
        "linear-gradient(to right, #ec4899, #8b5cf6)",  
    };  

  case "gradient-blue":  
    return {  
      background:  
        "linear-gradient(to right, #3b82f6, #06b6d4)",  
    };  

  case "dark":  
    return {  
      background: "#111827",  
    };  

  default:  
    return {  
      background: "#ffffff",  
    };  
}

};

return (

  <form  
  onSubmit={(e) => {  
    console.log("FORM SUBMIT DETECTED");  
    handleSubmitPost(e);  
  }}  

  className="
    bg-white
    p-5
    rounded-3xl
    shadow-lg
    border
    border-gray-100
    space-y-4
    w-full
    max-w-4xl
    mx-auto
"
>

<div  
  className="  
    sticky  
    top-0  
    z-50  
    bg-white  
    border-b  
    px-4  
    py-3  
    flex  
    items-center  
    justify-between  
  "  
>  
  <button

type="button"
onClick={() => {

setNewPost("");  
setMediaFiles([]);  
setSelectedFile(null);  
setLocation("");  
setLocationSuggestions([]);  
setFeeling("");  
setTagInput("");  
setTaggedFriends([]);  

navigate("/");

}}
className="text-red-500 font-medium"

> 

Cancel
</button>

<h2 className="font-bold text-lg">  
    Create Post  
  </h2>  

  <button

type="submit"
disabled={posting}
className={`
  text-white
  font-semibold
  px-8
  py-2.5
  rounded-full
  min-w-[110px]
  transition
  ${
    posting
      ? "bg-gray-400"
      : "bg-blue-500 hover:bg-blue-600"
  }
`}

> 

{posting ? "Posting..." : "Post"}
</button>
</div>

<div className="p-5 space-y-4">

 <div className="border-b pb-3"></div>  <div className="flex items-center gap-3 mb-4">  <img
src={
currentUser?.profilePic ||
"/default-avatar.png"
}
alt=""
className="
w-14
h-14
rounded-full
object-cover
"
/>

  <div>  <p className="font-semibold">  
  {currentUser?.name}  
</p>  

<div className="flex items-center gap-2">

<span className="  
text-xs  
bg-gray-100  
px-2  
py-1  
rounded-full  
">
🌎 Public
</span>

</div>  
  </div>  
</div>  


<button
  type="button"
  onClick={() => setShowTextArea(!showTextArea)}
  className="
    w-full
    p-3
    rounded-xl
    border
    bg-gray-50
    hover:bg-gray-100
    font-medium
  "
>
  {showTextArea ? "📝 Close Text Area" : "📝 Open Text Area"}
</button>


{/* TEXTAREA */}
{showTextArea && (
  <textarea
    rows={14}
    value={newPost}
    onChange={(e) => setNewPost(e.target.value)}
    onInput={(e) => {
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    }}
    placeholder={`Share a photo, video or thought... ${
      currentUser?.name || "User"
    }?`}
    style={{
      color: textColor,
      ...getBackgroundStyle(),
    }}
    className={`
      w-full
      p-6
      rounded-2xl
      resize-y
      transition-all
      duration-200
      focus:outline-none
      focus:ring-2
      focus:ring-blue-400
      min-h-[200px]
      text-lg
      border-0
      shadow-none
      ${fontStyle}
    `}
  />
)}

{/* EXPANDED */}
<div className="space-y-4">

 {/* EMOJI */}  

      {showEmoji && (  

        <div className="border rounded-xl p-2 bg-white shadow">  

          <Suspense fallback={<div>Loading...</div>}>  

            <EmojiPicker  
              onEmojiClick={(  
                emojiData  
              ) => {  

                setNewPost(  
                  (prev) =>  
                    prev +  
                    emojiData.emoji  
                );  
              }}  
            />  

          </Suspense>  

        </div>  

      )}  

      {/* LOCATION */}  

      {showLocation && (  

        <div className="relative">  

          <input  
            value={location}  
            onChange={async (e) => {  

              const value =  
                e.target.value;  

              setLocation(value);  

              if (  
                value.length < 2  
              ) {  

                setLocationSuggestions(  
                  []  
                );  

                return;  
              }  

              try {  

                const res =  
                  await fetch(  
                    `https://nominatim.openstreetmap.org/search?format=json&q=${value}`  
                  );  

                const data =  
                  await res.json();  

                setLocationSuggestions(  
                  data.slice(0, 5)  
                );  

              } catch (err) {  

                console.error(err);  

              }  
            }}  
            placeholder="Add location..."  
            className="w-full border p-2 rounded-lg"  
          />  

          {locationSuggestions.length > 0 && (  

            <div className="absolute z-50 w-full bg-white border rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">  

              {locationSuggestions.map(  
                (item) => (  

                  <button  
                    key={  
                      item.place_id  
                    }  
                    type="button"  
                    onClick={() => {  

                      setLocation(  
                        item.display_name  
                      );  

                      setLocationSuggestions(  
                        []  
                      );  
                    }}  
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-sm"  
                  >  
                    📍{" "}  
                    {  
                      item.display_name  
                    }  
                  </button>  
                )  
              )}  
            </div>  
          )}  
        </div>  
      )}  

      {/* FEELING */}  

      {showFeeling && (  

        <input  
          value={feeling}  
          onChange={(e) =>  
            setFeeling(  
              e.target.value  
            )  
          }  
          placeholder="How are you feeling?"  
          className="w-full border p-2 rounded-lg"  
        />  
      )}  

      {/* TAG */}  

      {showTag && (  

        <input  
          value={tagInput}  
          onChange={(e) =>  
            handleTagFriends(  
              e.target.value  
            )  
          }  
          placeholder="Tag friends"  
          className="w-full border p-2 rounded-lg"  
        />  
      )}  

{/* POSTEDITOR */}

<PostEditor
  preview={
    mediaFiles[0]
      ? URL.createObjectURL(mediaFiles[0])
      : null
  }
  media={mediaFiles[0]}
  text={newPost}

  textPosition={textPosition}
  setTextPosition={setTextPosition}

  textColor={textColor}
  setTextColor={setTextColor}

  textRotation={textRotation}
  setTextRotation={setTextRotation}

  size={size}
  setSize={setSize}

  stickers={stickers}
  setStickers={setStickers}

  selectedSticker={selectedSticker}
  setSelectedSticker={setSelectedSticker}

  backgroundColor={backgroundColor}
  setBackgroundColor={setBackgroundColor}

  music={music}
  setMusic={setMusic}

  musicList={musicList}

  activeTool={activeTool}
  setActiveTool={setActiveTool}
/>


        {/* MEDIA */}  

      <div className="bg-gray-50 border rounded-2xl p-4">

  <h3 className="font-semibold mb-3">  
    Photos & Videos  
  </h3>  <MediaUpload  
mediaFiles={mediaFiles}  
setMediaFiles={setMediaFiles}  
setSelectedFile={setSelectedFile}  
/>

</div>  


{/* STYLE OPTIONS */}

<div className="border rounded-2xl p-4 bg-white shadow-sm">  <button
type="button"
onClick={() =>
setShowCustomize(!showCustomize)
}
className="
w-full
flex
justify-between
items-center
font-semibold
text-gray-700
"

> 

<span>🎨 Customize Post</span>  

<span>  
  {showCustomize ? "▲" : "▼"}  
</span>

  </button>  {showCustomize && (

  <div className="mt-4 space-y-5">  {/* TEXT COLORS */}  

<div>  

  <p className="text-sm font-medium mb-3">  
    Text Color  
  </p>  

  <div className="flex gap-3 flex-wrap">  

    <button  
      type="button"  
      onClick={() => setTextColor("#000000")}  
      className="w-10 h-10 rounded-full bg-black border-2"  
    />  

    <button  
      type="button"  
      onClick={() => setTextColor("#ffffff")}  
      className="w-10 h-10 rounded-full bg-white border-2"  
    />  

    <button  
      type="button"  
      onClick={() => setTextColor("#ef4444")}  
      className="w-10 h-10 rounded-full bg-red-500 border-2"  
    />  

    <button  
      type="button"  
      onClick={() => setTextColor("#3b82f6")}  
      className="w-10 h-10 rounded-full bg-blue-500 border-2"  
    />  

    <button  
      type="button"  
      onClick={() => setTextColor("#22c55e")}  
      className="w-10 h-10 rounded-full bg-green-500 border-2"  
    />  

  </div>  

</div>  

{/* BACKGROUND */}  

<div>  

  <p className="text-sm font-medium mb-3">  
    Background Style  
  </p>  

  <div className="flex gap-2 flex-wrap">  

    <button  
      type="button"  
      onClick={() =>  
        setBackgroundStyle("white")  
      }  
      className="px-4 py-2 rounded-lg bg-gray-200"  
    >  
      Default  
    </button>  

    <button  
      type="button"  
      onClick={() =>  
        setBackgroundStyle(  
          "gradient-purple"  
        )  
      }  
      className="px-4 py-2 rounded-lg bg-purple-500 text-white"  
    >  
      Purple  
    </button>  

    <button  
      type="button"  
      onClick={() =>  
        setBackgroundStyle(  
          "gradient-blue"  
        )  
      }  
      className="px-4 py-2 rounded-lg bg-blue-500 text-white"  
    >  
      Blue  
    </button>  

    <button  
      type="button"  
      onClick={() =>  
        setBackgroundStyle("dark")  
      }  
      className="px-4 py-2 rounded-lg bg-black text-white"  
    >  
      Dark  
    </button>  

  </div>  

</div>  

{/* FONT STYLE */}  

<div>  

  <p className="text-sm font-medium mb-3">  
    Font Style  
  </p>  

  <div className="flex gap-2 flex-wrap">  

    <button  
      type="button"  
      onClick={() =>  
        setFontStyle("font-sans")  
      }  
      className="  
        px-4  
        py-2  
        border  
        rounded-lg  
      "  
    >  
      Normal  
    </button>  

    <button  
      type="button"  
      onClick={() =>  
        setFontStyle("font-serif")  
      }  
      className="  
        px-4  
        py-2  
        border  
        rounded-lg  
        font-serif  
      "  
    >  
      Serif  
    </button>  

    <button  
      type="button"  
      onClick={() =>  
        setFontStyle("font-mono")  
      }  
      className="  
        px-4  
        py-2  
        border  
        rounded-lg  
        font-mono  
      "  
    >  
      Mono  
    </button>  

  </div>  

</div>

  </div>  )}

 </div>   
{/* ACTIONS */}

<div className="border rounded-2xl p-4 bg-white shadow-sm">    <p className="text-sm font-semibold text-gray-600 mb-3">  
    Add to your post  
  </p>    <div className="grid grid-cols-2 gap-3">  <button  
  type="button"  
  onClick={() => setShowEmoji(!showEmoji)}  
  className="  
    flex  
    items-center  
    justify-center  
    gap-2  
    p-3  
    rounded-xl  
    bg-yellow-50  
    border  
    hover:bg-yellow-100  
    transition  
  "  
>  
  😊 Emoji  
</button>  

<button  
  type="button"  
  onClick={() =>  
    setShowLocation(!showLocation)  
  }  
  className="  
    flex  
    items-center  
    justify-center  
    gap-2  
    p-3  
    rounded-xl  
    bg-blue-50  
    border  
    hover:bg-blue-100  
    transition  
  "  
>  
  📍 Location  
</button>  

<button  
  type="button"  
  onClick={() =>  
    setShowFeeling(!showFeeling)  
  }  
  className="  
    flex  
    items-center  
    justify-center  
    gap-2  
    p-3  
    rounded-xl  
    bg-green-50  
    border  
    hover:bg-green-100  
    transition  
  "  
>  
  😊 Feeling  
</button>  

<button  
  type="button"  
  onClick={() =>  
    setShowTag(!showTag)  
  }  
  className="  
    flex  
    items-center  
    justify-center  
    gap-2  
    p-3  
    rounded-xl  
    bg-purple-50  
    border  
    hover:bg-purple-100  
    transition  
  "  
>  
  🏷 Tag Friends  
</button>

  </div> 
 </div>  
</div>  

  

</div> 
 </form>

);
};

export default PostComposer;

