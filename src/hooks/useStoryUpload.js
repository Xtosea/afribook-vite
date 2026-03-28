import { useState } from "react";
import { API_BASE } from "../api/api";
import { useR2Upload } from "./useR2Upload";

export const useStoryUpload = () => {
  const { uploadVideo } = useR2Upload();
  const [uploading, setUploading] = useState(false);

  const uploadStory = async (file) => {
    try {
      setUploading(true);

      console.log("Uploading file:", file);

      const mediaUrl = await uploadVideo(file);

      console.log("R2 URL:", mediaUrl);

      if (!mediaUrl) {
        throw new Error("Upload failed");
      }

      const token = localStorage.getItem("token");

      console.log("Token:", token);

      const res = await fetch(`${API_BASE}/api/stories/upload-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: mediaUrl,
          type: file.type.startsWith("image") ? "image" : "video",
        }),
      });

      const data = await res.json();

      console.log("Story response:", data);

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