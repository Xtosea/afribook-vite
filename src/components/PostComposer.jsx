return (

  <form  
    onSubmit={handleSubmitPost}  
    className="  
      bg-white  
      p-5  
      rounded-3xl  
      shadow-lg  
      border  
      border-gray-100  
      space-y-4  
    "  
  >  <div  
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
      px-5  
      py-2  
      rounded-full  
      text-white  
      font-medium  
      ${  
        posting  
          ? "bg-gray-400"  
          : "bg-blue-500"  
      }  
    `}  
  >  
    {posting ? "Posting..." : "Post"}  
  </button>  
</div>  

<div

className="
p-5
space-y-4
max-h-[75vh]
overflow-y-auto
"

> 

 <div className="border-b pb-3"></div>  {/* TEXTAREA */}

  <textarea  
  rows={4}  
  value={newPost}  
  onChange={(e) =>  
    setNewPost(e.target.value)  
  }  
  placeholder={`Share a photo, video or thought... ${  
    currentUser?.name || "User"  
  }?`}  
  style={{  
    color: textColor,  
    ...getBackgroundStyle(),  
  }}  
  className={`  
    w-full  
    p-4  
    rounded-2xl  
    border  
    resize-none  
    transition-all  
    duration-200  
    focus:outline-none  
    focus:ring-2  
    focus:ring-blue-400  
    relative  
    z-0  
    h-28  
    ${fontStyle}  
  `}  
/>  
  
  
      {/* EXPANDED */}  
  
      {(  
  
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
  
          {/* MEDIA */}  
  
          <div className="space-y-3">  
  
  <label  
    htmlFor="media-upload"  
    className="  
      w-full  
      flex  
      items-center  
      gap-3  
      p-3  
      border  
      rounded-xl  
      cursor-pointer  
      hover:bg-gray-50  
    "  
  >  
    <ImagePlus size={22} />  
    Add Photos & Videos  
  </label>  
  
  <MediaUpload  
    inputId="media-upload"  
    mediaFiles={mediaFiles}  
    setMediaFiles={setMediaFiles}  
    setSelectedFile={setSelectedFile}  
  />  
  
</div>  
  
</div>  
  
</div>  
  
</div>  
  
          {/* AI BUTTON */}  
  
          <button  
            type="button"  
            onClick={handleEnhance}  
            disabled={loading}  
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl transition"  
          >  
            {loading  
              ? "Enhancing..."  
              : "✨ AI Enhance"}  
          </button>  
  
          {/* STYLE OPTIONS */}  
  
<div className="space-y-4 border-t pt-4 relative z-10">  
  
  <p className="text-sm font-semibold text-gray-600">  
    Customize Post  
  </p>  
  
  {/* TEXT COLORS */}  
  
<div className="flex gap-3 flex-wrap relative z-50">  
  
  <button  
    type="button"  
    onClick={() => setTextColor("#000000")}  
    className="w-10 h-10 rounded-full border-2 border-gray-300 bg-black cursor-pointer"  
  />  
  
  <button  
    type="button"  
    onClick={() => setTextColor("#ffffff")}  
    className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white cursor-pointer"  
  />  
  
  <button  
    type="button"  
    onClick={() => {  
      console.log("RED CLICKED");  
      setTextColor("#ef4444");  
    }}  
    className="w-10 h-10 rounded-full border-2 border-gray-300 bg-red-500 cursor-pointer relative z-50"  
  />  
  
  <button  
    type="button"  
    onClick={() => {  
      console.log("BLUE CLICKED");  
      setTextColor("#3b82f6");  
    }}  
    className="w-10 h-10 rounded-full border-2 border-gray-300 bg-blue-500 cursor-pointer relative z-50"  
  />  
  
  <button  
    type="button"  
    onClick={() => {  
      console.log("GREEN CLICKED");  
      setTextColor("#22c55e");  
    }}  
    className="w-10 h-10 rounded-full border-2 border-gray-300 bg-green-500 cursor-pointer relative z-50"  
  />  
  
</div>  
  {/* BACKGROUND OPTIONS */}  
  
  <div className="flex gap-2 flex-wrap">  
  
    <button  
      type="button"  
      onClick={() =>  
        setBackgroundStyle("white")  
      }  
      className="px-4 py-2 rounded-lg bg-gray-200 text-sm cursor-pointer"  
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
      className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm cursor-pointer"  
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
      className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm cursor-pointer"  
    >  
      Blue  
    </button>  
  
    <button  
      type="button"  
      onClick={() =>  
        setBackgroundStyle("dark")  
      }  
      className="px-4 py-2 rounded-lg bg-black text-white text-sm cursor-pointer"  
    >  
      Dark  
    </button>  
  
  </div>  
  
  {/* FONT OPTIONS */}  
  
  <div className="flex gap-2 flex-wrap">  
  
    <button  
      type="button"  
      onClick={() =>  
        setFontStyle("font-sans")  
      }  
      className="px-4 py-2 border rounded-lg cursor-pointer"  
    >  
      Normal  
    </button>  
  
    <button  
      type="button"  
      onClick={() =>  
        setFontStyle("font-serif")  
      }  
      className="px-4 py-2 border rounded-lg font-serif cursor-pointer"  
    >  
      Serif  
    </button>  
  
    <button  
      type="button"  
      onClick={() =>  
        setFontStyle("font-mono")  
      }  
      className="px-4 py-2 border rounded-lg font-mono cursor-pointer"  
    >  
      Mono  
    </button>  
  
  </div>  
  
</div>  
  
          {/* ACTIONS */}  
  
  
 <div className="space-y-3">  
  
  <button  
    type="button"  
    onClick={() =>  
      setShowEmoji(!showEmoji)  
    }  
    className="  
      w-full  
      flex  
      items-center  
      gap-3  
      p-3  
      border  
      rounded-xl  
    "  
  >  
    <Smile size={20} />  
    Add Emoji  
  </button>  
  
  <button  
    type="button"  
    onClick={() =>  
      setShowLocation(!showLocation)  
    }  
    className="  
      w-full  
      flex  
      items-center  
      gap-3  
      p-3  
      border  
      rounded-xl  
    "  
  >  
    <MapPin size={20} />  
    Add Location  
  </button>  
  
  <button  
    type="button"  
    onClick={() =>  
      setShowFeeling(!showFeeling)  
    }  
    className="  
      w-full  
      flex  
      items-center  
      gap-3  
      p-3  
      border  
      rounded-xl  
    "  
  >  
    <Smile size={20} />  
    Feeling / Activity  
  </button>  
  
  <button  
    type="button"  
    onClick={() =>  
      setShowTag(!showTag)  
    }  
    className="  
      w-full  
      flex  
      items-center  
      gap-3  
      p-3  
      border  
      rounded-xl  
    "  
  >  
    <Tag size={20} />  
    Tag Friends  
  </button>  
  
</div>  
  
  
  </div>  
  
  
</div>  
  
    </form>  
  );  
};  
  
export default PostComposer;  
  
