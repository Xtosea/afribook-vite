import { useState } from "react";
import { API_BASE } from "../api/api";
import { useR2Upload } from "./useR2Upload";

export const useStoryUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { uploadVideo } = useR2Upload();

  const uploadStory = async (file) => {
    if (!file) return null;

    setLoading(true);
    setError(null);

    try {
      // Upload to R2
      const url = await uploadVideo(file);

      if (!url) throw new Error("R2 upload failed");

      const token = localStorage.getItem("token");
      const type = file.type.startsWith("video") ? "video" : "image";

      // Create story
      const res = await fetch(`${API_BASE}/api/stories/upload-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url,
          type,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Story creation failed");
      }

      setLoading(false);
      return data;

    } catch (err) {
      console.error("Story upload error:", err);
      setError(err);
      setLoading(false);
      return null;
    }
  };

  return {
    uploadStory,
    loading,
    error,
  };
};