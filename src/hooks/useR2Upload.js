import { useState } from "react";
import { API_BASE } from "../api/api";

export const useR2Upload = () => {
  const [error, setError] = useState(null);

  const uploadVideo = async (file) => {
    try {
      const formData = new FormData();
      formData.append("video", file);

      const res = await fetch(`${API_BASE}/api/videos/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();

      console.log("Upload response:", data); // DEBUG

      return (
        data?.media?.[0]?.url ||
        data?.post?.media?.[0]?.url ||
        data?.url ||
        null
      );

    } catch (err) {
      console.error("Video upload error:", err);
      setError(err);
      return null;
    }
  };

  return { uploadVideo, error };
};