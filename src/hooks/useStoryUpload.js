// src/hooks/useStoryUpload.js
import { useState } from "react";
import { API_BASE } from "../api/api";

export const useStoryUpload = () => {
  const [loading, setLoading] = useState(false);

  const uploadStory = async (file) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("media", file);

      const res = await fetch(`${API_BASE}/api/r2/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Story upload failed");
      }

      const data = await res.json();
      return data.story;

    } catch (err) {
      console.error("Story upload error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadStory, loading };
};