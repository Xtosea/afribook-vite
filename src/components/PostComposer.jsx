import React, { useState, lazy, Suspense } from "react";
import MediaUpload from "./MediaUpload";
import { API_BASE } from "../api/api";

import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";
import { useAIEnhance } from "../hooks/useAIEnhance";
import validateVideoDuration from "../utils/validateVideoDuration";

import { MapPin, Smile, Tag } from "lucide-react";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

const PostComposer = ({ token, currentUser, onPostCreated }) => {
  const [expanded, setExpanded] = useState(false);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newPost, setNewPost] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [showEmoji, setShowEmoji] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showFeeling, setShowFeeling] = useState(false);
  const [showTag, setShowTag] = useState(false);

  const [location, setLocation] = useState("");
  const [feeling, setFeeling] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [taggedFriends, setTaggedFriends] = useState([]);

  const [locationSuggestions, setLocationSuggestions] = useState([]);

  const [textColor, setTextColor] = useState("#000000");
  const [backgroundStyle, setBackgroundStyle] = useState("white");
  const [fontStyle, setFontStyle] = useState("font-sans");

  const { uploadImage } = useCloudinaryUpload();
  const { uploadVideo } = useR2Upload();
  const { enhanceImage } = useAIEnhance();

  const closeComposer = () => {
    setExpanded(false);
    setNewPost("");
    setMediaFiles([]);
    setSelectedFile(null);
    setLocation("");
    setFeeling("");
    setTagInput("");
    setTaggedFriends([]);
    setLocationSuggestions([]);
    setShowEmoji(false);
    setShowLocation(false);
    setShowFeeling(false);
    setShowTag(false);
    setTextColor("#000000");
    setBackgroundStyle("white");
    setFontStyle("font-sans");
  };

  const handleTagFriends = (value) => {
    setTagInput(value);
    setTaggedFriends(
      value.split(",").map((f) => f.trim()).filter(Boolean)
    );
  };

  const handleEnhance = async () => {
    try {
      const image = mediaFiles.find((f) => f.type?.startsWith("image"));
      if (!image) return alert("Please upload an image first");

      setLoading(true);

      let imageUrl = image.url;
      if (!imageUrl && image instanceof File) {
        imageUrl = await uploadImage(image);
      }

      const enhancedUrl = await enhanceImage(imageUrl);

      setMediaFiles((prev) => [
        ...prev.filter((f) => f !== image),
        { url: enhancedUrl, type: "image", enhanced: true },
      ]);

      alert("Image enhanced!");
    } catch (err) {
      alert(err.message || "Enhance failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost && mediaFiles.length === 0) return;

    setPosting(true);

    try {
      const uploadedMedia = [];

      for (let file of mediaFiles) {
        if (file.enhanced && file.url) {
          uploadedMedia.push({ url: file.url, type: "image" });
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

        const thumbnailFile = new File([thumbnailBlob], "thumb.jpg", {
          type: "image/jpeg",
        });

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
          location,
          feeling,
          taggedFriends,
          textColor,
          backgroundStyle,
          fontStyle,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Post failed");

      onPostCreated?.(data.post);
      closeComposer();
    } catch (err) {
      alert(err.message || "Post failed");
    } finally {
      setPosting(false);
    }
  };

  if (!expanded) {
    return (
      <div onClick={() => setExpanded(true)} className="p-4 border rounded-2xl cursor-pointer">
        What's on your mind, {currentUser?.name || "User"}?
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={closeComposer} />

      <div className="fixed inset-0 z-50 flex justify-center p-4 overflow-y-auto">
        <form
          onSubmit={handleSubmitPost}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-xl"
        >
          <div className="flex justify-between p-4 border-b">
            <button type="button" onClick={closeComposer} className="text-red-500">
              Cancel
            </button>

            <button type="submit" disabled={posting} className="bg-blue-500 text-white px-4 py-2 rounded-full">
              {posting ? "Posting..." : "Post"}
            </button>
          </div>

          <div className="p-4 space-y-4">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className={`w-full border p-3 rounded-xl ${fontStyle}`}
              style={{ color: textColor }}
              placeholder="What's on your mind?"
            />

            <MediaUpload
              mediaFiles={mediaFiles}
              setMediaFiles={setMediaFiles}
              setSelectedFile={setSelectedFile}
            />

            <button type="button" onClick={handleEnhance} className="bg-purple-500 text-white px-3 py-2 rounded-xl">
              ✨ AI Enhance
            </button>

            <div className="flex gap-2">
              <button type="button" onClick={() => setShowEmoji(!showEmoji)}>😊</button>
              <button type="button" onClick={() => setShowLocation(!showLocation)}><MapPin /></button>
              <button type="button" onClick={() => setShowFeeling(!showFeeling)}><Smile /></button>
              <button type="button" onClick={() => setShowTag(!showTag)}><Tag /></button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default PostComposer;