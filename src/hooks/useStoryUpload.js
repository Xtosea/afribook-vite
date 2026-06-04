import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

export function useStoryUpload() {
  const [loading, setLoading] = useState(false);

  const [progress, setProgress] = useState(0);

  const [error, setError] = useState(null);

  const uploadStory = async (file) => {
    try {
      setLoading(true);

      setProgress(0);

      setError(null);

      // =========================
      // GET SIGNED URL
      // =========================

      const signedRes = await fetch(
        `${API_BASE}/api/r2/signed-url?contentType=${file.type}`
      );

      const signedData = await signedRes.json();

      if (!signedData.uploadUrl) {
        throw new Error("Failed to generate signed URL");
      }

      // =========================
      // UPLOAD DIRECTLY TO R2
      // =========================

      await axios.put(
        signedData.uploadUrl,
        file,
        {
          headers: {
            "Content-Type": file.type,
          },

          onUploadProgress: (event) => {
            const percent = Math.round(
              (event.loaded * 100) / event.total
            );

            setProgress(percent);
          },
        }
      );

      // =========================
      // SAVE STORY TO DATABASE
      // =========================

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/storyr2`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            media: [
              {
                url: signedData.fileUrl,

                type: file.type.startsWith("video")
                  ? "video"
                  : "image",
              },
            ],
          }),
        }
      );

      const story = await res.json();

      return story;

    } catch (err) {

      console.error("Story Upload Error:", err);

      setError(err.message);

      throw err;

    } finally {

      setLoading(false);

    }
  };

  return {
    uploadStory,
    loading,
    progress,
    error,
  };
}