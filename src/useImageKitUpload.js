// src/hooks/useImageKitUpload.js
import { useState } from "react";
import { API_BASE, fetchWithToken } from "../api/api";

export const useImageKitUpload = () => {
  const [loading, setLoading] = useState(false);

  const uploadImageKit = async (file, token) => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");

      return result.url; // <-- public ImageKit URL
    } finally {
      setLoading(false);
    }
  };

  return { uploadImageKit, loading };
};