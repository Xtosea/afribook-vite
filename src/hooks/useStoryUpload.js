import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

export function useStoryUpload() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFile = async (file) => {
    try {
      setLoading(true);
      setProgress(0);
      setError(null);

      // Get signed URL
      const signedRes = await fetch(
        `${API_BASE}/api/r2/signed-url?contentType=${file.type}`
      );

      const signedData = await signedRes.json();

      if (!signedData.uploadUrl) {
        throw new Error("Failed to generate signed URL");
      }

      // Upload directly to R2
      await axios.put(signedData.uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },

        onUploadProgress: (event) => {
          const percent = Math.round(
            (event.loaded * 100) / event.total
          );

          setProgress(percent);
        },
      });

      return signedData.fileUrl;

    } catch (err) {
      console.error("R2 Upload Error:", err);

      setError(err.message);

      throw err;

    } finally {
      setLoading(false);
    }
  };

  return {
    uploadFile,
    loading,
    progress,
    error,
  };
}