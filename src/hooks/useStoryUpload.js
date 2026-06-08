import { useState } from "react";
import axios from "axios";
import { compressVideo } from "../utils/compressVideo";

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

      if (
        if (file.size > 10 * 1024 * 1024 && file.type.startsWith("video/")) {
  file = await compressVideo(file);
} &&
        !file.type.startsWith("audio/")
      ) {
        throw new Error(
          "Only video and audio files are allowed"
        );
      }

      /* =========================
         GET SIGNED URL
      ========================= */

      const signedRes = await fetch(
        `${API_BASE}/api/storyR2/signed-url?contentType=${encodeURIComponent(
          file.type
        )}`
      );

      console.log(
        "SIGNED URL STATUS:",
        signedRes.status
      );

      const signedRaw =
        await signedRes.text();

      console.log(
        "SIGNED URL RESPONSE:",
        signedRaw
      );

      const signedData =
        JSON.parse(signedRaw);

      if (!signedData.uploadUrl) {
        throw new Error(
          signedData.error ||
            "Failed to generate signed URL"
        );
      }

      /* =========================
         UPLOAD TO R2
      ========================= */

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

      /* =========================
         DETERMINE MEDIA TYPE
      ========================= */

      let mediaType = "video";

      if (
        file.type.startsWith("audio/")
      ) {
        mediaType = "audio";
      }

      /* =========================
         SAVE STORY
      ========================= */

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/storyR2`,
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

      console.log(
        "SAVE STORY STATUS:",
        res.status
      );

      const raw = await res.text();

      console.log(
        "SAVE STORY RAW:",
        raw
      );

      const story = JSON.parse(raw);

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