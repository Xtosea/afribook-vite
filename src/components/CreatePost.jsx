// src/components/CreatePost.jsx
import React, { useState, useRef } from "react";
import { API_BASE, fetchWithToken } from "../api/api";

const CreatePost = ({ onPostCreated }) => {
  const [text, setText] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const token = localStorage.getItem("token");

  // =========================
  // Generate video thumbnail
  // =========================
  const generateThumbnail = (file) =>
    new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = url;
      video.muted = true;
      video.currentTime = 1; // first second
      video.addEventListener("loadeddata", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg"));
      });
    });

  // =========================
  // Handle file selection
  // =========================
  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(files);

    const thumbs = await Promise.all(
      files.map(async (file) => {
        if (file.type.startsWith("video")) {
          return await generateThumbnail(file);
        } else if (file.type.startsWith("image")) {
          return URL.createObjectURL(file);
        } else {
          return null;
        }
      })
    );

    setThumbnails(thumbs);
  };

  // =========================
  // Submit post
  // =========================
  const handleSubmit = async () => {
    if (!text.trim() && mediaFiles.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("text", text);
      mediaFiles.forEach((file) => formData.append("media", file));

      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data?.post) {
        onPostCreated(data.post); // update feed
        setText("");
        setMediaFiles([]);
        setThumbnails([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Post creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-3">
      <textarea
        className="w-full border rounded-lg p-2"
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* Media Preview */}
      {thumbnails.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {thumbnails.map((src, i) => (
            <div key={i} className="relative">
              <img src={src} alt="preview" className="w-full h-48 object-cover rounded-xl" />
              {mediaFiles[i].type.startsWith("video") && (
                <span className="absolute top-2 left-2 text-white text-3xl">▶️</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-center">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFiles}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          disabled={loading}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default CreatePost;