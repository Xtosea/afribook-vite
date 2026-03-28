import { useState } from "react";
import { API_BASE } from "../api/api";

export const useR2Upload = () => {
  const [loading, setLoading] = useState(false);

  const uploadVideo = async (file) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/r2/upload-url`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to get R2 signed URL");
      }

      const { uploadUrl, publicUrl, headers } = await res.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers,
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload to R2 failed");
      }

      return publicUrl;

    } catch (err) {
      console.error("R2 Upload Error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadVideo, loading };
};