// src/hooks/useStoryUpload.js
import { useState } from "react";
import { API_BASE } from "../api/api";

export const useStoryUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadStory = async (file) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("media", file);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/r2/story/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload story");

      const data = await res.json();
      return data.story;
    } catch (err) {
      console.error("Story upload error:", err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadStory, loading, error };
};