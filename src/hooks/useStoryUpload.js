import { useState } from "react";
import { API_BASE } from "../api/api";
import { useR2Upload } from "./useR2Upload";

export const useStoryUpload = () => {
  const { uploadVideo } = useR2Upload();
  const [uploading, setUploading] = useState(false);

  const uploadStory = async (file) => {
    try {
      setUploading(true);

      const videoUrl = await uploadVideo(file);

      if (!videoUrl) {
        throw new Error("Upload failed");
      }

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/stories/upload-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          videoUrl,
        }),
      });

      if (!res.ok) {
        throw new Error("Story upload failed");
      }

      const data = await res.json();

      return data;

    } catch (err) {
      console.error("Story upload error:", err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadStory, uploading };
};