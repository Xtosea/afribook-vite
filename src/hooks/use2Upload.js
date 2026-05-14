// hooks/useR2Upload.js

import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

export function useR2Upload() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file) => {
    try {
      setLoading(true);
      setProgress(0);

      // 1. Get signed URL
      const signRes = await fetch(
        `${API_BASE}/api/r2/signed-url?contentType=${file.type}`
      );

      const signData = await signRes.json();

      if (!signRes.ok) {
        throw new Error(signData.error || "Failed to get signed URL");
      }

      const { uploadUrl, fileUrl } = signData;

      // 2. Upload directly to R2
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },

        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) /
              progressEvent.total
          );

          setProgress(percent);
        },
      });

      return fileUrl;

    } catch (err) {
      console.error("R2 UPLOAD ERROR:", err);
      throw err;

    } finally {
      setLoading(false);
    }
  };

  return {
    uploadFile,
    loading,
    progress,
  };
}