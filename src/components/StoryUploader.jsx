// src/components/StoryUploader.jsx
import React, { useState } from "react";
import { API_BASE } from "../api/api";
import { socket } from "../socket";

const StoryUploader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Select a file first!");
    setUploading(true);

    try {
      // Step 1: Get signed URL from backend
      const res = await fetch(`${API_BASE}/api/r2/story-upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const { url, publicUrl } = await res.json();

      // Step 2: Upload file directly to R2
      await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      // Step 3: Save story to DB
      const token = localStorage.getItem("token");
      const storyRes = await fetch(`${API_BASE}/api/stories/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          base64: await fileToBase64(file),
        }),
      });

      const storyData = await storyRes.json();

      if (storyRes.ok) {
        // Emit new story event
        socket.emit("new-story", storyData);
        setFile(null);
      } else {
        alert(storyData.error || "Failed to upload story");
      }
    } catch (err) {
      console.error("Story upload error:", err);
      alert("Upload failed. Check console.");
    }

    setUploading(false);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  return (
    <div className="flex items-center gap-2">
      <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload Story"}
      </button>
    </div>
  );
};

export default StoryUploader;