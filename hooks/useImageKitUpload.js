// hooks/useImageKitUpload.js
import { useState } from "react";

export function useImageKitUpload() {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState(null);

  const uploadImage = async (file) => {
    setLoading(true);
    setError(null);

    try {
      // Get signed parameters from backend
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/imagekit/auth`);
      const auth = await res.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("publicKey", import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
      formData.append("signature", auth.signature);
      formData.append("token", auth.token);
      formData.append("expire", auth.expire);

      const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await uploadRes.json();
      if (data.url) setUrl(data.url);
      else throw new Error(data.message || "Upload failed");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { uploadImage, loading, url, error };
}