import React, { useState, lazy, Suspense } from "react";
import MediaUpload from "./MediaUpload";
import { API_BASE } from "../api/api";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

const PostComposer = ({
  token,
  currentUser,
  onPostCreated,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [posting, setPosting] = useState(false);

  const [newPost, setNewPost] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);

  const [showEmoji, setShowEmoji] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showFeeling, setShowFeeling] = useState(false);
  const [showTag, setShowTag] = useState(false);

  const [location, setLocation] = useState("");
  const [feeling, setFeeling] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [taggedFriends, setTaggedFriends] = useState([]);

  // =========================
  // TAG FRIENDS
  // =========================
  const handleTagFriends = (value) => {
    setTagInput(value);
    setTaggedFriends(
      value.split(",").map((f) => f.trim())
    );
  };

  // =========================
  // SUBMIT POST
  // =========================
  const handleSubmitPost = async (e) => {
    e.preventDefault();

    if (!newPost && mediaFiles.length === 0) return;

    setPosting(true);

    try {
      const uploadedMedia = [];

      for (let file of mediaFiles) {
        const type = file.type.startsWith("image")
          ? "image"
          : "video";

        let url = "";

        if (type === "image") {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch(
            `${API_BASE}/api/posts`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          const data = await res.json();
          url = data.url;
        } else {
          const res = await fetch(
            `${API_BASE}/api/posts`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ file }),
            }
          );

          const data = await res.json();
          url = data.url;
        }

        uploadedMedia.push({ url, type });
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
            location,
            feeling,
            taggedFriends,
          }),
        }
      );

      const data = await res.json();

      onPostCreated?.(data);

      // RESET
      setNewPost("");
      setMediaFiles([]);
      setLocation("");
      setFeeling("");
      setTagInput("");
      setTaggedFriends([]);
      setExpanded(false);

    } catch (err) {
      console.error(err);
      alert("Post failed");
    }

    setPosting(false);
  };

  return (
    <form
      onSubmit={handleSubmitPost}
      className="bg-white p-5 rounded-2xl shadow-md space-y-4"
    >
      {/* =========================
          TEXTAREA (FACEBOOK STYLE)
      ========================= */}
      <textarea
        rows={expanded ? 4 : 1}
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        onFocus={() => setExpanded(true)}
        placeholder={`What's on your mind, ${currentUser?.name || "User"}?`}
        className={`w-full p-4 rounded-2xl border resize-none transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-400
        ${expanded ? "h-28" : "h-12"}`}
      />

      {/* =========================
          EXPANDED OPTIONS
      ========================= */}
      {expanded && (
        <div className="space-y-3">

          {/* EMOJI PICKER */}
          {showEmoji && (
            <div className="border rounded-xl p-2 bg-white shadow">
              <Suspense fallback={<div>Loading emojis...</div>}>
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setNewPost((prev) => prev + emojiData.emoji);
                  }}
                />
              </Suspense>
            </div>
          )}

          {/* LOCATION */}
          {showLocation && (
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location..."
              className="w-full border p-2 rounded-lg"
            />
          )}

          {/* FEELING */}
          {showFeeling && (
            <input
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              placeholder="How are you feeling?"
              className="w-full border p-2 rounded-lg"
            />
          )}

          {/* TAG FRIENDS */}
          {showTag && (
            <input
              value={tagInput}
              onChange={(e) => handleTagFriends(e.target.value)}
              placeholder="Tag friends (comma separated)"
              className="w-full border p-2 rounded-lg"
            />
          )}

          {/* MEDIA UPLOAD */}
          <MediaUpload
            mediaFiles={mediaFiles}
            setMediaFiles={setMediaFiles}
          />

          {/* ACTION BUTTONS */}
          <div className="flex justify-between items-center flex-wrap gap-2">

            <div className="flex gap-2 flex-wrap">

              <button
                type="button"
                onClick={() => setShowEmoji(!showEmoji)}
                className="px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-sm"
              >
                😊 Emoji
              </button>

              <button
                type="button"
                onClick={() => setShowLocation(!showLocation)}
                className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm"
              >
                📍 Location
              </button>

              <button
                type="button"
                onClick={() => setShowFeeling(!showFeeling)}
                className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm"
              >
                😊 Feeling
              </button>

              <button
                type="button"
                onClick={() => setShowTag(!showTag)}
                className="px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm"
              >
                🏷 Tag
              </button>

            </div>

            {/* POST BUTTON */}
            <button
              type="submit"
              disabled={posting}
              className={`px-6 py-2 rounded-full text-white font-medium transition
              ${posting ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              {posting ? "Posting..." : "Post"}
            </button>

          </div>
        </div>
      )}
    </form>
  );
};

export default PostComposer;