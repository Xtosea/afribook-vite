import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../api/api";

/**
 * Upload music/audio files directly to R2
 * Returns clean music object for Story DB
 */

const useR2StoryMusic = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadMusic = async (file) => {
    try {
      if (!file) {
        throw new Error("No music file selected");
      }

      if (!file.type.startsWith("audio/")) {
        throw new Error("Only audio files are allowed");
      }

      setLoading(true);
      setProgress(0);
      setError(null);

      // ================= GET SIGNED URL =================
      const signedRes = await fetch(
        `${API_BASE}/api/r2storymusic/signed-url?contentType=${encodeURIComponent(
          file.type
        )}`
      );

      const signedData = await signedRes.json();

      if (!signedRes.ok || !signedData.uploadUrl) {
        throw new Error(
          signedData.error || "Failed to get upload URL"
        );
      }

      // ================= UPLOAD TO R2 =================
      await axios.put(signedData.uploadUrl, file, {
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

      // ================= RETURN CLEAN MUSIC OBJECT =================
      const musicData = {
        title: file.name || "Unknown",
        artist: "",
        audioUrl: signedData.fileUrl,
        coverUrl: "",
      };

      return musicData;
    } catch (err) {
      console.error("Music upload error:", err);
      setError(err.message || "Upload failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadMusic,
    loading,
    progress,
    error,
  };
};

export default useR2StoryMusic;