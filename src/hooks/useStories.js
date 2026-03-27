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
      const token = localStorage.getItem("token");
      const formData = new FormData();
      files.forEach((file) => formData.append("video", file));

      const res = await fetch(`${API_BASE}/api/stories/upload-video`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Story upload returned non-JSON:", text);
        data = null;
      }

      if (!res.ok || !data?._id) throw new Error(data?.error || "Upload failed");

      setLoading(false);
      return data; // story object
    } catch (err) {
      console.error("Story upload error:", err);
      setError(err);
      setLoading(false);
      return null;
    }
  };

  return { uploadStory, loading, error };
};