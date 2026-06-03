import React, {
  useState,
  lazy,
  Suspense,
} from "react";

import MediaUpload from "./MediaUpload";

import { API_BASE } from "../api/api";

import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";
import { useAIEnhance } from "../hooks/useAIEnhance";

import validateVideoDuration from "../utils/validateVideoDuration";

const EmojiPicker = lazy(() =>
  import("emoji-picker-react")
);

const PostComposer = ({
  token,
  currentUser,
  onPostCreated,
}) => {

  const [expanded, setExpanded] =
    useState(false);

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
  // AI ENHANCE
  // =========================

  const { enhanceImage } =
    useAIEnhance();

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
  // AI ENHANCE
  // =========================

  const handleEnhance = async () => {

    try {

      // find first image
      const image = mediaFiles.find(
        (f) =>
          f.type &&
          f.type.startsWith("image")
      );

      if (!image) {

        alert(
          "Please upload an image first"
        );

        return;
      }

      setLoading(true);

      let imageUrl = image.url;

      // if not uploaded yet → upload first
      if (!imageUrl && image instanceof File) {

        imageUrl =
          await uploadImage(image);
      }

      if (!imageUrl) {

        alert(
          "Image upload failed"
        );

        return;
      }

      // send URL to AI
      const enhancedUrl =
        await enhanceImage(imageUrl);

      // replace image
      setMediaFiles((prev) => [

        ...prev.filter(
          (f) => f !== image
        ),

        {
          url: enhancedUrl,
          type: "image",
          enhanced: true,
        },
      ]);

      alert("Image enhanced!");

    } catch (err) {

      console.error(err);

      alert(
        err.message ||
        "Enhance failed"
      );

    } finally {

      setLoading(false);

    }
  };

  // =========================
  // SUBMIT POST
  // =========================

  const handleSubmitPost = async (e) => {

    e.preventDefault();

    if (
      !newPost &&
      mediaFiles.length === 0
    ) {
      return;
    }

    setPosting(true);

    try {

      const uploadedMedia = [];

      // =========================
      // UPLOAD FILES
      // =========================

      for (let file of mediaFiles) {

  if (file.enhanced && file.url) {
    uploadedMedia.push({
      url: file.url,
      type: "image",
    });
    continue;
  }

  const type =
    file.type?.startsWith("image")
      ? "image"
      : "video";

  if (type === "image") {

    const url =
      await uploadImage(file);

    uploadedMedia.push({
      url,
      type: "image",
    });

    continue;
  }

  await validateVideoDuration(
    file,
    180
  );

  const {
    videoUrl,
    thumbnailBlob,
  } = await uploadVideo(file);

  const thumbnailFile =
    new File(
      [thumbnailBlob],
      "thumbnail.jpg",
      {
        type: "image/jpeg",
      }
    );

  const thumbnailUrl =
    await uploadImage(
      thumbnailFile
    );

  uploadedMedia.push({
    url: videoUrl,
    type: "video",
    thumbnailUrl,
  });
}
      // =========================
      // CREATE POST
      // =========================

      const res = await fetch(
        `${API_BASE}/api/posts`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            content: newPost,

            media: uploadedMedia,

            location,

            feeling,

            taggedFriends,

            textColor,

            backgroundStyle,

            fontStyle,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {

        throw new Error(
          data.error ||
          "Post failed"
        );
      }

      // =========================
      // UPDATE FEED
      // =========================

      onPostCreated?.(data.post);

      // =========================
      // RESET
      // =========================

      setNewPost("");

      setMediaFiles([]);

      setSelectedFile(null);

      setLocation("");

      setFeeling("");

      setTagInput("");

      setTaggedFriends([]);

      setLocationSuggestions([]);

      setExpanded(false);

      setTextColor("#000000");

      setBackgroundStyle("white");

      setFontStyle("font-sans");

    } catch (err) {

      console.error(err);

      alert(
        err.message ||
        "Post failed"
      );

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
  >
    

    <div className="flex items-center gap-3 mb-3">
  <img
    src={currentUser?.profilePic}
    alt=""
    className="w-12 h-12 rounded-full object-cover"
  />
 
          {/* TEXT FOR A SHARE POST, IMAGE OR THOUGHT*/}
  <div>
    <h3 className="font-bold text-xl text-gray-900">
  What's happening today?
</h3>

<p className="text-sm text-gray-500">
  Share photos, videos, thoughts and moments with your friends
</p>

    <p className="text-sm text-gray-500">
      Share photos, videos, reels and updates with friends
    </p>
  </div>
</div>
<div className="border-b pb-3"></div>

      {/* TEXTAREA */}


<div className="flex justify-between pt-2 border-t">
  <button
    type="button"
    className="flex items-center gap-2 text-red-500"
  >
    🎥 Video
  </button>

  <button
    type="button"
    className="flex items-center gap-2 text-green-500"
  >
    📷 Photo
  </button>

  <button
    type="button"
    className="flex items-center gap-2 text-blue-500"
  >
    😊 Feeling
  </button>
</div>

      <textarea
  rows={expanded ? 4 : 1}
  value={newPost}
  onChange={(e) =>
    setNewPost(e.target.value)
  }
  onFocus={() =>
    setExpanded(true)
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
    ${expanded ? "h-28" : "h-12"}
    ${fontStyle}
  `}
/>

      {/* EXPANDED */}

      {expanded && (

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

          <MediaUpload
            mediaFiles={mediaFiles}
            setMediaFiles={
              setMediaFiles
            }
            setSelectedFile={
              setSelectedFile
            }
          />

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

          <div className="flex justify-between items-center flex-wrap gap-2">

            <div className="flex gap-2 flex-wrap">

              <button
                type="button"
                onClick={() =>
                  setShowEmoji(
                    !showEmoji
                  )
                }
                className="px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-sm"
              >
                😊 Emoji
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowLocation(
                    !showLocation
                  )
                }
                className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm"
              >
                📍 Location
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowFeeling(
                    !showFeeling
                  )
                }
                className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm"
              >
                😊 Feeling
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowTag(
                    !showTag
                  )
                }
                className="px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm"
              >
                🏷 Tag
              </button>

            </div>

            {/* RIGHT ACTIONS */}

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() => {

                  setExpanded(false);

                  setNewPost("");

                  setMediaFiles([]);

                  setSelectedFile(
                    null
                  );

                  setLocation("");

                  setLocationSuggestions(
                    []
                  );

                  setFeeling("");

                  setTagInput("");

                  setTaggedFriends([]);

                }}
                className="px-6 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={posting}
                className={`
                  px-6
                  py-2
                  rounded-full
                  text-white
                  font-medium
                  transition
                  ${
                    posting
                      ? "bg-gray-400"
                      : "bg-blue-500 hover:bg-blue-600"
                  }
                `}
              >
                {posting
                  ? "Posting..."
                  : "Post"}
              </button>

            </div>

          </div>

        </div>

      )}

    </form>
  );
};

export default PostComposer;