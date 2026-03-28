// src/hooks/useStoryUpload.js

import { useState } from "react";
import { API_BASE } from "../api/api";

export const useStoryUpload = () => {
  const [loading, setLoading] = useState(false);

  const uploadStory = async (file) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return null;
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/stories/upload-video`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: file,
          type: file.type.startsWith("video") ? "video" : "image"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      return data;

    } catch (err) {
      console.error("Story upload error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadStory, loading };
};