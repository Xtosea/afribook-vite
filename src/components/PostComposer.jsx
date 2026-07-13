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
import { uploadToCloudinary } from "../utils/uploadToCloudinary";




const PostComposer = () => {



const navigate = useNavigate();



const { token, currentUser } = useAuth();

const EmojiPicker = lazy(() =>
import("emoji-picker-react")
);




const [isPosting, setIsPosting] = useState(false);

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
const [cloudinaryUrl, setCloudinaryUrl] = useState("");
const [preview, setPreview] = useState("");


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



const applyAI = async (effect) => {
  try {
    if (!mediaFiles.length) {
      alert("Select an image first");
      return;
    }

    let imageUrl = cloudinaryUrl;

    if (!imageUrl) {
      imageUrl = await uploadToCloudinary(mediaFiles[0]);
      setCloudinaryUrl(imageUrl);
    }

    let newUrl = imageUrl;

    switch (effect) {
      case "enhance":
        newUrl = imageUrl.replace(
          "/upload/",
          "/upload/e_enhance/"
        );
        break;

      case "beauty":
        newUrl = imageUrl.replace(
          "/upload/",
          "/upload/e_improve/"
        );
        break;

      case "afroglow":
        newUrl = imageUrl.replace(
          "/upload/",
          "/upload/e_vibrance:50,e_improve/"
        );
        break;

      default:
        return;
    }

    setPreview(newUrl);
    setCloudinaryUrl(newUrl);

    // ADD THIS
    setMediaFiles((prev) =>
      prev.map((file, index) =>
        index === 0
          ? {
              ...file,
              enhancedUrl: newUrl,
              enhanced: true,
              url: newUrl,
            }
          : file
      )
    );

  } catch (err) {
    console.error(err);
    alert("AI processing failed");
  }
};
// =========================
// HANDLE TAG FRINDS 
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
  if (e) e.preventDefault();

  if (!newPost && mediaFiles.length === 0) return;

const urlRegex = /(https?:\/\/[^\s]+)/i;

const link = newPost.match(urlRegex)?.[0] || null;




  setIsPosting(true);

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

      const type = file.type?.startsWith("image")
        ? "image"
        : "video";

      if (type === "image") {
        const url = await uploadImage(file);

        uploadedMedia.push({
          url,
          type: "image",
        });

        continue;
      }

      await validateVideoDuration(file, 180);

      const {
        videoUrl,
        thumbnailBlob,
      } = await uploadVideo(file);

      const thumbnailFile = new File(
        [thumbnailBlob],
        "thumbnail.jpg",
        {
          type: "image/jpeg",
        }
      );

      const thumbnailUrl =
        await uploadImage(thumbnailFile);

      uploadedMedia.push({
        url: videoUrl,
        type: "video",
        thumbnailUrl,
      });
    }

    const res = await fetch(
      `${API_BASE}/api/posts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  content: newPost,
  media: uploadedMedia,

  type: link ? "link" : uploadedMedia.length ? "media" : "text",

  link,

  editor: editorData,

  location,
  feeling,
  taggedFriends,
})

          editor: {
  textPosition,
  textRotation,
  textSize: size,
  textColor,
  stickers,
  backgroundColor,
  music: ...
},

          location,
          feeling,
          taggedFriends,
          textColor,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.error || "Post failed"
      );
    }

    setNewPost("");
    setMediaFiles([]);
    setMusic(null);
    setStickers([]);
    setSelectedSticker(null);
    setTextRotation(0);
    setTextPosition({
      x: 50,
      y: 50,
    });
    setSize(27);
    setBackgroundColor("#000000");
    setActiveTool(null);

    navigate("/");
  } catch (err) {
    console.error(
      "SUBMIT ERROR:",
      err
    );

    alert(
      err.message || "Post failed"
    );
  } finally {
    setIsPosting(false);
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





      

{/* POSTEDITOR */}

<PostEditor
  preview={
    mediaFiles[0]
      ? URL.createObjectURL(mediaFiles[0])
      : null
  }
  media={mediaFiles[0]}
currentUser={currentUser}

  
  text={newPost}
  setText={setNewPost}

  
  isPosting={isPosting}


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
applyAI={applyAI}

/>

         

  


 </form>

);
};

export default PostComposer;

