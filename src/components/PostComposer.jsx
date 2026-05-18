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

  // TEXT STYLE STATES

  const [textColor, setTextColor] =
    useState("#000000");

  const [
    backgroundStyle,
    setBackgroundStyle,
  ] = useState("");

  const [fontStyle, setFontStyle] =
    useState("font-sans");

  // IMPORTANT: store selected image properly
const [selectedFile, setSelectedFile] = useState(null);
const [previewUrl, setPreviewUrl] = useState(null);


  // ✅ CLOUDINARY
  const { uploadImage } =
    useCloudinaryUpload();

  // ✅ R2
  const { uploadVideo } =
    useR2Upload();

  // ✅ AI ENHANCE
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
    );
  };

  // =========================
  // AI ENHANCE
  // =========================

  const handleEnhance = async () => {
  try {
    if (!selectedFile) {
      alert("Please select an image first");
      return;
    }

    setLoading(true);

    const enhancedUrl = await enhanceImage(selectedFile);

    const enhancedFile = {
      url: enhancedUrl,
      type: "image",
      enhanced: true,
    };

    setMediaFiles((prev) => [enhancedFile]);

    setPreviewUrl(enhancedUrl);
    setSelectedFile(null);

  } catch (err) {
    console.error(err);
    alert("Enhance failed");
  }

  setLoading(false);
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

        // AI ENHANCED IMAGE
        if (
          file.enhanced &&
          file.url
        ) {

          uploadedMedia.push({
            url: file.url,
            type: "image",
          });

          continue;
        }

        const type =
          file.type.startsWith("image")
            ? "image"
            : "video";

        let url = "";

        // =========================
        // IMAGE → CLOUDINARY
        // =========================

        if (type === "image") {

          url =
            await uploadImage(file);

        }

        // =========================
        // VIDEO → R2
        // =========================

        else {

          // 3 MINUTES MAX
          await validateVideoDuration(
            file,
            180
          );

          url =
            await uploadVideo(file);

        }

        uploadedMedia.push({
          url,
          type,
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

      console.log(
        "POST RESPONSE:",
        data
      );

      if (!res.ok) {

        throw new Error(
          data.error ||
          "Post failed"
        );
      }

      // =========================
      // ADD TO FEED
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

    } catch (err) {

      console.error(err);

      alert(
        err.message ||
        "Post failed"
      );

    }

    setPosting(false);

  };

  return (

    <form
      onSubmit={handleSubmitPost}
      className="bg-white p-5 rounded-2xl shadow-md space-y-4"
    >

      {/* TEXTAREA */}

      <textarea
  value={newPost}
  onChange={(e) => setNewPost(e.target.value)}
  className={`w-full p-4 rounded-2xl border ${backgroundStyle}`}
  style={{ color: textColor }}
/>
        }
        placeholder={`Upload Video/Picture, ${
          currentUser?.name ||
          "User"
        }?`}
        style={{
          color: textColor,
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
          ${expanded ? "h-28" : "h-12"}
          ${backgroundStyle}
          ${fontStyle}
        `}
      />

      {/* EXPANDED */}

      {expanded && (

        <div className="space-y-3">

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

              {/* SUGGESTIONS */}

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

          {/* AI ENHANCE */}

          <button
            type="button"
            onClick={handleEnhance}
            className="bg-purple-500 text-white px-4 py-2 rounded-xl"
          >
            {loading
              ? "Enhancing..."
              : "✨ AI Enhance"}
          </button>

          {/* STYLE OPTIONS */}

          <div className="flex gap-2 flex-wrap">

            <button
              type="button"
              onClick={() =>
                setTextColor(
                  "#ff0000"
                )
              }
              className="w-8 h-8 rounded-full bg-red-500"
            />

            <button
              type="button"
              onClick={() =>
                setTextColor(
                  "#0000ff"
                )
              }
              className="w-8 h-8 rounded-full bg-blue-500"
            />

            <button
              type="button"
              onClick={() =>
                setBackgroundStyle(
                  "bg-gradient-to-r from-pink-500 to-purple-500"
                )
              }
              className="px-3 py-1 rounded bg-purple-500 text-white"
            >
              Gradient
            </button>

            <button
              type="button"
              onClick={() =>
                setFontStyle(
                  "font-serif"
                )
              }
              className="px-3 py-1 rounded bg-gray-200"
            >
              Serif
            </button>

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

            {/* CANCEL */}

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

            {/* POST */}

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

      )}

    </form>

  );

};

export default PostComposer;