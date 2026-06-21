import React, { useRef, useEffect } from "react";
import Draggable from "react-draggable";
import MediaUpload from "../MediaUpload";




const PostEditor = ({
currentUser,

  preview,
  media,
  
  text,
  setText,

  textPosition,
  setTextPosition,

  textColor,
  setTextColor,

  textRotation,
  setTextRotation,

  size,
  setSize,

  stickers,
  setStickers,

  selectedSticker,
  setSelectedSticker,

  backgroundColor,
  setBackgroundColor,

  music,
  setMusic,

  musicList,

  activeTool,
  setActiveTool,

  location,
  setLocation,

  feeling,
  setFeeling,

  tagInput,
  setTagInput,
  applyAI,

  handleTagFriends,

  handleSubmitPost,

  onCancel,

mediaFiles,
setMediaFiles,


}) => {


const audioRef = useRef(null);

useEffect(() => {
  if (audioRef.current) {
    audioRef.current.load();
  }
}, [music]);




 return (
  <div
    className="
      relative
      w-full
      h-[80vh]
      rounded-xl
      overflow-hidden
      bg-black
      sticky
      top-16
    "
    style={{ backgroundColor }}
  >



<button
  type="button"
  onClick={onCancel}
  className="
    absolute
    top-4
    left-15
    z-50
    bg-black/70
    text-white
    px-4
    py-2
    rounded-full
  "
>
  ✕ Cancel
</button>



  <div
  className="
    absolute
    top-2
    left-2
    z-50
    flex
    items-center
    gap-2
    bg-black/40
    backdrop-blur-sm
    px-2
    py-1
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




<button
  type="button"
  onClick={handleSubmitPost}
  className="
    absolute
    top-4
    right-4
    z-50
    bg-blue-500
    text-white
    px-5
    py-2
    rounded-full
  "
>
  Post
</button>



  <div
  className={`absolute inset-0 grid gap-1 z-0 ${
    mediaFiles.length === 2
      ? "grid-cols-2"
      : mediaFiles.length >= 3
      ? "grid-cols-2 grid-rows-2"
      : ""
  }`}
>
  {mediaFiles.map((file, index) => (
    <div
      key={index}
      className="overflow-hidden"
    >
      {file.type.startsWith("image") ? (
        <img
          src={
            file.enhancedUrl
              ? file.enhancedUrl
              : URL.createObjectURL(file)
          }
          className="w-full h-full object-cover"
          alt=""
        />
      ) : (
        <video
          src={URL.createObjectURL(file)}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  ))}
</div>
{/* MUSIC LABEL */}
{music && (
  <div
    className="
      absolute
      top-3
      left-3
      bg-black/70
      text-white
      px-3
      py-2
      rounded-full
      z-50
      flex
      items-center
      gap-2
    "
  >
    <span>
      🎵 {music.title || "Music"}
    </span>

    <button
      type="button"
      onClick={() => audioRef.current?.play()}
      className="
        bg-green-500
        px-2
        py-1
        rounded-full
        text-xs
      "
    >
      ▶
    </button>

    <button
      type="button"
      onClick={() => audioRef.current?.pause()}
      className="
        bg-red-500
        px-2
        py-1
        rounded-full
        text-xs
      "
    >
      ⏸
    </button>
  </div>
)}


      {/* STICKERS */}
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
            className="
              absolute
              cursor-move
              select-none
            "
            style={{
              fontSize: `${sticker.size}px`,
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

      {/* DRAGGABLE TEXT */}
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
              className="
                font-bold
                select-none
              "
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

      
{/* TOOLBAR */}
<div
  className="
  absolute
  top-20
  right-4
  z-50
  flex
  flex-col
  gap-3
"
  
>

    <button
    type="button"
    onClick={() => setActiveTool("location")}
    className="w-12 h-12 rounded-full bg-black/60 text-white"
  >
    📍
  </button>

  <button
    type="button"
    onClick={() => setActiveTool("feeling")}
    className="w-12 h-12 rounded-full bg-black/60 text-white"
  >
    😊
  </button>

  <button
    type="button"
    onClick={() => setActiveTool("tag")}
    className="w-12 h-12 rounded-full bg-black/60 text-white"
  >
    🏷
  </button>

<button
onClick={() => setActiveTool("sticker")}
className="bg-black/60 text-white p-3 rounded-full"
>
😀
</button>

<button
onClick={() => setActiveTool("music")}
className="bg-black/60 text-white p-3 rounded-full"
>
🎵
</button>

</div>   {/* CLOSE TOOLBAR HERE */}


{activeTool && (
<div
className="
absolute
bottom-0
left-0
right-0
z-[100]
bg-black/90
p-4
w-full
max-h-[35vh]
overflow-y-auto
backdrop-blur-md
"
>


{activeTool && (
<div
className="
absolute
bottom-0
left-0
right-0
z-[100]
bg-black/90
p-4
max-h-[35vh]
overflow-y-auto
"
>




    <input
      type="text"
      placeholder="Add text..."
      value={text}
      onChange={(e) =>
        setText(e.target.value)
      }
      className="
        w-full
        p-2
        rounded
        mb-2
      "
    />

    <input
      type="color"
      value={textColor}
      onChange={(e)=>
        setTextColor(e.target.value)
      }
    />

    <input
      type="range"
      min="20"
      max="120"
      value={size}
      onChange={(e)=>
        setSize(Number(e.target.value))
      }
      className="w-full"
    />

    <input
      type="range"
      min="-180"
      max="180"
      value={textRotation}
      onChange={(e)=>
        setTextRotation(
          Number(e.target.value)
        )
      }
      className="w-full"
    />

  </div>
)}



<button
onClick={() => setActiveTool("text")}
className="bg-black/60 text-white p-3 rounded-full"
>
Text
</button>

<button
onClick={() => setActiveTool("color")}
className="bg-black/60 text-white p-3 rounded-full"
>
🎨
</button>

  <button
    type="button"
    onClick={() => setActiveTool("background")}
    className="w-12 h-12 rounded-full bg-black/60 text-white"
  >
    🌈
  </button>
</div>

{media?.type?.startsWith("image") && (

<button
  type="button"
  onClick={() => setActiveTool("ai")}
  className="bg-black/60 text-white p-3 rounded-full"
>
  🤖
</button>

)}





    {activeTool && (
  <div
    className="
      absolute
      bottom-0
      left-0
      right-0
      bg-black/90
p-4
max-h-[35vh]
overflow-y-auto
backdrop-blur-md
      z-50
    "
  >


{activeTool === "sticker" && (
  <div className="flex gap-3 flex-wrap">
    {["🔥","❤️","😂","😎","🎉","💯"].map(
      (emoji) => (
        <button
          key={emoji}
          className="text-3xl"
          onClick={() =>
            setStickers((prev) => [
              ...prev,
              {
                emoji,
                x: 100,
                y: 100,
                size: 60,
              },
            ])
          }
        >
          {emoji}
        </button>
      )
    )}
  </div>
)}


{activeTool === "music" && (
  <div className="space-y-3">
    {/* Selected music player */}
    {music?.url && (
      <audio
        controls
        src={music.url}
        className="w-full"
      />
    )}

    {/* Music list */}
    <div className="max-h-48 overflow-y-auto space-y-2">
      {musicList?.map((song) => (
        <button
          key={song._id}
          type="button"
          onClick={() => setMusic(song)}
          className="
            block
            w-full
            text-left
            p-3
            rounded-lg
            bg-white/10
            text-white
          "
        >
          🎵 {song.title}
        </button>
      ))}
    </div>
  </div>
)}


{activeTool === "color" && (
  <input
    type="color"
    value={textColor}
    onChange={(e) =>
      setTextColor(e.target.value)
    }
  />
)}



{activeTool === "background" && (
  <input
    type="color"
    value={backgroundColor}
    onChange={(e) =>
      setBackgroundColor(
        e.target.value
      )
    }
  />
)}



{activeTool === "rotate" && (
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
)}



{activeTool === "size" && (
  <input
    type="range"
    min="20"
    max="150"
    value={size}
    onChange={(e) =>
      setSize(
        Number(e.target.value)
      )
    }
    className="w-full"
  />
)}

{activeTool === "location" && (
  <input
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    placeholder="Add location..."
    className="w-full p-3 rounded-lg"
  />
)}


{activeTool === "feeling" && (
  <input
    value={feeling}
    onChange={(e) => setFeeling(e.target.value)}
    placeholder="How are you feeling?"
    className="w-full p-3 rounded-lg"
  />
)}


{activeTool === "tag" && (
  <input
    value={tagInput}
    onChange={(e) => handleTagFriends(e.target.value)}
    placeholder="Tag friends..."
    className="w-full p-3 rounded-lg"
  />
)}

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
onClick={() => applyAI("afroglow")}
className="bg-orange-600 text-white p-2 rounded"
>
🌍 Afro Glow
</button>

</div>
)}


<button
  type="button"
  onClick={() => setActiveTool(null)}
  className="
    absolute
    top-2
    left-15
    bg-red-500
    text-white
    px-3
    py-1
    rounded-full
    z-[200]
  "
>
  ✕
</button>



 {music?.url && (
  <audio
    ref={audioRef}
    src={music.url}
    preload="metadata"
  />
)}


<div  
  className="  
    absolute  
    bottom-4  
    left-1/2  
    -translate-x-1/2  
    z-20  
  "  
>  
  <MediaUpload  
    mediaFiles={mediaFiles}  
    setMediaFiles={setMediaFiles}  
  />  
</div>
‎
‎


    </div>
  );
};

export default PostEditor;