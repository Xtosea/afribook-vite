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
className="
  absolute
  top-2
  left-1/2
  -translate-x-1/2
  z-50
  bg-black/70
  text-white
  px-4
  py-2
  rounded-full
"
>
  Cancel
</button>



  <div
  className="
    absolute
    top-2
    right-10
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

<button
  onClick={() => setActiveTool("text")}
  className="w-12 h-12 rounded-full bg-black/60 text-white"
>
  T
</button>

<button
  onClick={() => setActiveTool("color")}
  className="w-12 h-12 rounded-full bg-black/60 text-white"
>
  🎨
</button>

<button
  onClick={() => setActiveTool("background")}
  className="w-12 h-12 rounded-full bg-black/60 text-white"
>
  🌈
</button>

{media?.type?.startsWith("image") && (
  <button
    onClick={() => setActiveTool("ai")}
    className="w-12 h-12 rounded-full bg-black/60 text-white"
  >
    🤖
  </button>
)}



</div>   


{/* CLOSE TOOLBAR HERE */}




  {/* ACTIVE TOOL PANEL */}
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

    {/* CLOSE PANEL */}
    <button
      type="button"
      onClick={() => setActiveTool(null)}
      className="
        absolute
        top-2
        right-2
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


    {/* TEXT TOOL */}
    {activeTool === "text" && (
      <div className="space-y-3 mt-6">

        <input
          type="text"
          placeholder="Add text..."
          value={text}
          onChange={(e)=>setText(e.target.value)}
          className="
            w-full
            p-3
            rounded-lg
            text-black
          "
        />

        <label className="text-white">
          Text Color
        </label>

        <input
          type="color"
          value={textColor}
          onChange={(e)=>setTextColor(e.target.value)}
          className="w-full h-10"
        />


        <label className="text-white">
          Size
        </label>

        <input
          type="range"
          min="20"
          max="150"
          value={size}
          onChange={(e)=>setSize(Number(e.target.value))}
          className="w-full"
        />


        <label className="text-white">
          Rotate
        </label>

        <input
          type="range"
          min="-180"
          max="180"
          value={textRotation}
          onChange={(e)=>
            setTextRotation(Number(e.target.value))
          }
          className="w-full"
        />

      </div>
    )}



    {/* STICKERS */}
    {activeTool === "sticker" && (
      <div className="flex flex-wrap gap-4 mt-6">

        {["🔥","❤️","😂","😎","🎉","💯"].map(
          (emoji)=>(
            <button
              key={emoji}
              className="text-4xl"
              onClick={() =>
                setStickers(prev=>[
                  ...prev,
                  {
                    emoji,
                    x:100,
                    y:100,
                    size:60
                  }
                ])
              }
            >
              {emoji}
            </button>
          )
        )}

      </div>
    )}



    {/* MUSIC */}
    {activeTool === "music" && (
      <div className="mt-6 space-y-3">

        {music?.url && (
          <audio
            controls
            src={music.url}
            className="w-full"
          />
        )}


        {musicList?.map(song=>(
          <button
            key={song._id}
            onClick={()=>setMusic(song)}
            className="
              w-full
              p-3
              rounded-lg
              bg-white/10
              text-white
              text-left
            "
          >
            🎵 {song.title}
          </button>
        ))}

      </div>
    )}



    {/* COLOR */}
    {activeTool === "color" && (
      <input
        type="color"
        value={textColor}
        onChange={(e)=>setTextColor(e.target.value)}
        className="w-full h-12 mt-6"
      />
    )}



    {/* BACKGROUND */}
    {activeTool === "background" && (
      <input
        type="color"
        value={backgroundColor}
        onChange={(e)=>
          setBackgroundColor(e.target.value)
        }
        className="w-full h-12 mt-6"
      />
    )}



    {/* LOCATION */}
    {activeTool === "location" && (
      <input
        value={location}
        onChange={(e)=>setLocation(e.target.value)}
        placeholder="Add location..."
        className="
          w-full
          p-3
          rounded-lg
          mt-6
          text-black
        "
      />
    )}



    {/* FEELING */}
    {activeTool === "feeling" && (
      <input
        value={feeling}
        onChange={(e)=>setFeeling(e.target.value)}
        placeholder="How are you feeling?"
        className="
          w-full
          p-3
          rounded-lg
          mt-6
          text-black
        "
      />
    )}



    {/* TAG */}
    {activeTool === "tag" && (
      <input
        value={tagInput}
        onChange={(e)=>handleTagFriends(e.target.value)}
        placeholder="Tag friends..."
        className="
          w-full
          p-3
          rounded-lg
          mt-6
          text-black
        "
      />
    )}

          n{/* AI */}
    {activeTool === "ai" && (
      <div className="flex gap-3 mt-6">

        <button
          onClick={()=>applyAI("enhance")}
          className="bg-blue-600 text-white p-3 rounded-lg"
        >
          ✨ Enhance
        </button>


        <button
          onClick={()=>applyAI("beauty")}
          className="bg-pink-600 text-white p-3 rounded-lg"
        >
          💄 Beauty
        </button>


        <button
          onClick={()=>applyAI("afroglow")}
          className="bg-orange-600 text-white p-3 rounded-lg"
        >
          🌍 Afro Glow
        </button>

      </div>
    )}

  </div>
)}






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