// src/hooks/useStoryUpload.js
import { useState } from "react";
import { API_BASE } from "../api/api";

export const useStoryUpload = () => {
  const [loading, setLoading] = useState(false);

  const uploadStory = async (file) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      // 1️⃣ Get R2 signed URL from backend
      const urlRes = await fetch(`${API_BASE}/api/r2/upload-url`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!urlRes.ok) throw new Error("Failed to get R2 signed URL");

      const { uploadUrl, fileName, headers } = await urlRes.json();

      // 2️⃣ Upload file to Cloudflare R2
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          Authorization: headers.Authorization,
        },
        body: file,
      });

      if (!putRes.ok) throw new Error("R2 upload failed");

      // 3️⃣ Tell backend to create Story entry
      const storyRes = await fetch(`${API_BASE}/api/stories/upload-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: `https://${R2_BUCKET}.r2.cloudflarestorage.com/${fileName}`,
          type: file.type.startsWith("video") ? "video" : "image",
        }),
      });

      if (!storyRes.ok) throw new Error("Story upload failed");

      const story = await storyRes.json();
      return story;
    } catch (err) {
      console.error("Story upload error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadStory, loading };
};