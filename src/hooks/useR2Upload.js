import { useState } from "react";

const R2_UPLOAD_URL = import.meta.env.VITE_R2_UPLOAD_URL; // backend route
const R2_CUSTOM_DOMAIN = import.meta.env.VITE_R2_CUSTOM_DOMAIN;

export const useR2Upload = () => {
  const [progress, setProgress] = useState(0);

  const uploadVideo = async (file, onProgress = () => {}) => {
    try {
      const formData = new FormData();
      formData.append("video", file); // must match backend Multer field name

      const res = await fetch(`${R2_UPLOAD_URL}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      // Ensure URL uses custom domain
      if (data.url && !data.url.startsWith("http")) {
        return `${R2_CUSTOM_DOMAIN}/${data.url.split("/").pop()}`;
      }
      return data.url;
    } catch (err) {
      console.error("R2 UPLOAD ERROR:", err);
      return null;
    }
  };

  return { uploadVideo, progress, setProgress };
};