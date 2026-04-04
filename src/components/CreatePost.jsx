// src/components/CreatePost.jsx
import React, { useState, useRef, useEffect } from "react";
import { API_BASE, fetchWithToken } from "../api/api";

const CreatePost = ({ onPostCreated }) => {
  const [text, setText] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [thumbnails, setThumbnails] = useState({});
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef();

  // Generate video thumbnail
  const generateVideoThumbnail = (file) =>
    new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = url;
      video.currentTime = 1;
      video.addEventListener("loadeddata", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth / 2;
        canvas.height = video.videoHeight / 2;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
        URL.revokeObjectURL(url);
      });
    });

  // Handle file selection
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(files);

    // Generate thumbnails for videos
    const newThumbnails = {};
    for (const file of files) {
      if (file.type.startsWith("video")) {
        const thumb = await generateVideoThumbnail(file);
        newThumbnails[file.name] = thumb;
      }
    }
    setThumbnails(newThumbnails);
  };

  // Upload post
  const handlePost = async () => {
    if (!text.trim() && mediaFiles.length === 0) return;

    const formData = new FormData();
    formData.append("text", text);
    mediaFiles.forEach((file) => formData.append("media", file));

    setUploading(true);
    try {
      const res = await fetchWithToken(`${API_BASE}/api/posts`, localStorage.getItem("token"), {
        method: "POST",
        body: formData,
      });

      if (res) {
        setText("");
        setMediaFiles([]);
        setThumbnails({});
        if (onPostCreated) onPostCreated(res);
      }
    } catch (err) {
      console.error("Post creation error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-3">
      {/* Text input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full border rounded-lg p-2 resize-none"
      />

      {/* Media preview */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {mediaFiles.map((file, i) => {
            const isVideo = file.type.startsWith("video");
            return (
              <div key={i} className="relative">
                {isVideo ? (
                  <>
                    {thumbnails[file.name] && (
                      <img
                        src={thumbnails[file.name]}
                        alt="video thumbnail"
                        className="w-full h-48 object-cover rounded-xl cursor-pointer"
                        onClick={() => {
                          const videoEl = document.createElement("video");
                          videoEl.src = URL.createObjectURL(file);
                          videoEl.controls = true;
                          videoEl.autoplay = true;
                          videoEl.className = "fixed inset-0 z-50 w-full h-full bg-black";
                          document.body.appendChild(videoEl);
                          videoEl.onclick = () => document.body.removeChild(videoEl);
                        }}
                      />
                    )}
                  </>
                ) : (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="image preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* File input */}
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current.click()}
          className="bg-gray-200 px-4 py-2 rounded-lg"
        >
          Upload
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*,video/*"
          className="hidden"
        />

        <button
          onClick={handlePost}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          disabled={uploading}
        >
          {uploading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default CreatePost;