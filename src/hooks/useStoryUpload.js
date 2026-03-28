// src/hooks/useStoryUpload.js
import { useState } from "react";
import { API_BASE } from "../api/api";

export const useStoryUpload = () => {
  const [loading, setLoading] = useState(false);

  const uploadStory = async (file) => {
    setLoading(true);
    try {
      // 1️⃣ Request signed URL from backend
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/r2-stories/upload-url`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get upload URL");

      const { uploadUrl, headers, fileName } = data;

      // 2️⃣ Upload file to R2 via PUT
      await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Length": file.size,
        },
        body: file,
      });

      // 3️⃣ Return the URL for creating the story document
      // This is the public URL for your story
      const storyUrl = `https://${R2_BUCKET}.r2.cloudflarestorage.com/${fileName}`;
      return { url: storyUrl, type: file.type.startsWith("video") ? "video" : "image" };
    } catch (err) {
      console.error("Story upload error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadStory, loading };
};