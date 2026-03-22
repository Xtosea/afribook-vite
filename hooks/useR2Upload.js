// hooks/useR2Upload.js
import { useState } from "react";

export function useR2Upload() {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState(null);

  const uploadFile = async (file) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/r2/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) setUrl(data.url);
      else throw new Error(data.error || "Upload failed");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { uploadFile, loading, url, error };
}