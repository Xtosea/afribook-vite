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






const [showTextArea, setShowTextArea] = useState(false);
const [posting, setPosting] =
useState(false);



const [newPost, setNewPost] =
useState("");

const [mediaFiles, setMediaFiles] =
useState([]);

const [showEmoji, setShowEmoji] =
useState(false);

const [location, setLocation] = useState("");
const [feeling, setFeeling] = useState("");
const [tagInput, setTagInput] = useState("");
const [taggedFriends, setTaggedFriends] = useState([]);


// =========================
// TEXT STYLE STATES
// =========================
const [textColor, setTextColor] =
  useState("#ffffff");


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
// HANDLE TAHFRINDS 
// =========================
const handleTagFriends = (value) => {
  setTagInput(value);

  setTaggedFriends(
    value
      .split(",")
      .map((friend) => friend.trim())
      .filter(Boolean)
  );
};


// =========================
// HANDLE CANCEL 
// =========================

const handleCancel = () => {

setNewPost("");
setMediaFiles([]);
setSelectedFile(null);

setLocation("");
setFeeling("");
setTagInput("");
setTaggedFriends([]);

setMusic(null);
setStickers([]);
setSelectedSticker(null);

setTextRotation(0);
setTextPosition({
 x:50,
 y:50
});

setSize(60);
setBackgroundColor("#000000");

setActiveTool(null);

navigate("/");

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
    
    stickers,

    music: music
      ? {
          _id: music._id,
          title: music.title,
          url: music.url,
        }
      : null,
  },

  location,
  feeling,
  taggedFriends,
  textColor,
  
  ,
}),
});  

const data = await res.json();  
console.log("POST RESPONSE:", data);  

if (!res.ok) throw new Error(data.error || "Post failed");  

// RESET (ONLY ONCE, INSIDE FUNCTION)  
setNewPost("");  
setMediaFiles([]);  
setSelectedFile(null);  
  
  
setMusic(null);
setStickers([]);
setSelectedSticker(null);
setTextRotation(0);
setTextPosition({ x: 50, y: 50 });
setSize(60);
setBackgroundColor("#000000");
setActiveTool(null);

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
  
  


setMusic(null);
setStickers([]);
setSelectedSticker(null);
setTextRotation(0);
setTextPosition({ x: 50, y: 50 });
setSize(60);
setBackgroundColor("#000000");
setActiveTool(null);


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
    rows={4}
    value={newPost}
    onChange={(e) => setNewPost(e.target.value)}
    onInput={(e) => {
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    }}
    placeholder={`Share a photo, video or thought... ${
      currentUser?.name || "User"
    }?`}
    
    className="
  w-full
  p-6
  rounded-2xl
  resize-y
  transition-all
  duration-200
  focus:outline-none
  focus:ring-2
  focus:ring-blue-400
  min-h-[20px]
  text-lg
  border-0
  shadow-none
"
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

location={location}
setLocation={setLocation}

feeling={feeling}
setFeeling={setFeeling}

tagInput={tagInput}
setTagInput={setTagInput}

handleTagFriends={handleTagFriends}

handleSubmitPost={handleSubmitPost}

onCancel={handleCancel}

mediaFiles={mediaFiles}
setMediaFiles={setMediaFiles}

/>

          
</div>  

  

</div> 
 </form>

);
};

export default PostComposer;

