// src/hooks/useStoryUpload.js
import { useState } from "react";
import { API_BASE } from "../api/api";

export const useStoryUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadStory = async (files) => {
    if (!files || files.length === 0) return null;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("video", file)); // match backend field

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/stories/upload-video`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setLoading(false);
      return data; // returns the story object
    } catch (err) {
      console.error("Story Upload Error:", err);
      setError(err);
      setLoading(false);
      return null;
    }
  };

  return { uploadStory, loading, error };
};