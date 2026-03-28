import { useState } from "react";
import { API_BASE } from "../api/api";
import { useR2Upload } from "./useR2Upload";

export const useStoryUpload = () => {
  const [loading, setLoading] = useState(false);
  const { uploadVideo } = useR2Upload();

  const uploadStory = async (file) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // Upload to R2 first
      const url = await uploadVideo(file);

      if (!url) return null;

      // Save story in DB
      const res = await fetch(`${API_BASE}/api/stories/upload-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url,
          type: file.type.startsWith("video") ? "video" : "image",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
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