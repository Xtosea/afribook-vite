import { useState } from "react";
import axios from "axios";
import { compressStoryMedia } from "../utils/compressStoryMedia";

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

      /* =========================
         VALIDATION
      ========================= */
      if (
        !file.type.startsWith("video/") &&
        !file.type.startsWith("audio/") &&
        !file.type.startsWith("image/")
      ) {
        throw new Error("Unsupported file type");
      }

      /* =========================
         COMPRESSION (IMPORTANT)
      ========================= */
      file = await compressStoryMedia(file);

      /* =========================
         GET SIGNED URL
      ========================= */
      const signedRes = await fetch(
        `${API_BASE}/api/r2/signed-url?contentType=${encodeURIComponent(
          file.type
        )}`
      );

      const signedRaw = await signedRes.text();

console.log(
  "SIGNED URL STATUS:",
  signedRes.status
);

console.log(
  "SIGNED URL RESPONSE:",
  signedRaw
);

if (!signedRaw) {
  throw new Error(
    "Empty response from signed URL endpoint"
  );
}

let signedData;

try {
  signedData = JSON.parse(signedRaw);
} catch (err) {
  console.error(
    "Invalid JSON from signed URL endpoint:",
    signedRaw
  );

  throw new Error(
    "Server returned invalid JSON"
  );
}

if (!signedRes.ok || !signedData.uploadUrl) {
  throw new Error(
    signedData.error ||
      "Failed to generate signed URL"
  );
}

      /* =========================
         UPLOAD TO R2
      ========================= */
      await axios.put(signedData.uploadUrl, file, {
  timeout: 60000,

  headers: {
    "Content-Type": file.type,
  },

  onUploadProgress: (event) => {
    if (!event.total) return;

    const percent = Math.round(
      (event.loaded * 100) / event.total
    );

    setProgress(percent);
  },
});

      /* =========================
         MEDIA TYPE
      ========================= */
      let mediaType = "video";

      if (file.type.startsWith("audio/")) {
        mediaType = "audio";
      }

      if (file.type.startsWith("image/")) {
        mediaType = "image";
      }

      /* =========================
         SAVE STORY
      ========================= */
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/storyR2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text,
          music,
          stickers,
          backgroundColor,
          media: [
            {
              url: signedData.fileUrl,
              type: mediaType,
            },
          ],
        }),
      });

      const raw = await res.text();

      console.log("SAVE STORY RESPONSE:", raw);

      let story;
      try {
        story = JSON.parse(raw);
      } catch (e) {
        throw new Error("Invalid JSON response from server");
      }

      if (!res.ok) {
        throw new Error(story.error || "Failed to save story");
      }

      return story;
    } catch (err) {
      console.error("Story Upload Error:", err);

      setError(err.message || "Story upload failed");
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