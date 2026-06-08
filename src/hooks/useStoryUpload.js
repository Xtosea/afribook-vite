import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

export function useStoryUpload() {
  const [loading, setLoading] = useState(false);

  const [progress, setProgress] = useState(0);

  const [error, setError] = useState(null);

  const uploadStory = async ({
    file,
    text,
    music,
    stickers,
    backgroundColor,
  }) => {
    try {
      if (!file) {
        throw new Error("No file selected");
      }

      setLoading(true);
      setProgress(0);
      setError(null);

      // Only allow video and audio
      if (
        !file.type.startsWith("video/") &&
        !file.type.startsWith("audio/")
      ) {
        throw new Error(
          "Only video and audio files are allowed"
        );
      }

      // =========================
      // GET SIGNED URL
      // =========================

      const signedRes = await fetch(
        `${API_BASE}/api/r2/signed-url?contentType=${encodeURIComponent(
          file.type
        )}`
      );

      const signedData = await signedRes.json();

      if (!signedData.uploadUrl) {
        throw new Error(
          signedData.error ||
            "Failed to generate signed URL"
        );
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
              (event.loaded * 100) /
                event.total
            );

            setProgress(percent);
          },
        }
      );

      // =========================
      // DETERMINE MEDIA TYPE
      // =========================

      let mediaType = "video";

      if (
        file.type.startsWith("audio/")
      ) {
        mediaType = "audio";
      }

      // =========================
      // SAVE STORY TO DATABASE
      // =========================

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/storyr2`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            text,
            music,
            stickers,
            backgroundColor,

            media: [
              {
                url:
                  signedData.fileUrl,
                type: mediaType,
              },
            ],
          }),
        }
      );

      const story =
        await res.json();

      if (!res.ok) {
        throw new Error(
          story.error ||
            "Failed to save story"
        );
      }

      return story;

    } catch (err) {
      console.error(
        "Story Upload Error:",
        err
      );

      setError(
        err.message ||
          "Story upload failed"
      );

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