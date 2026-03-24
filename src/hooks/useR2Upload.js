// src/hooks/useR2Upload.js
import { useState } from "react";
import { API_BASE } from "../api/api";

export const useR2Upload = () => {
  const [error, setError] = useState(null);

  const uploadVideo = async (file, onProgress) => {
    try {
      // Step 1: Get signed URL from backend
      const res = await fetch(`${API_BASE}/api/r2/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });

      if (!res.ok) throw new Error("Failed to get R2 signed URL");
      const { url, publicUrl } = await res.json();

      // Step 2: Upload file to R2
      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      // Step 3: Return public URL to use in posts
      return publicUrl;
    } catch (err) {
      setError(err);
      console.error("R2 Upload Error:", err);
      return null;
    }
  };

  return { uploadVideo, error };
};