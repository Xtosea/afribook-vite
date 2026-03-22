import { useState } from "react";

const R2_ENDPOINT = import.meta.env.VITE_R2_ENDPOINT;
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME;
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
const R2_CUSTOM_DOMAIN = import.meta.env.VITE_R2_CUSTOM_DOMAIN;

export const useR2Upload = () => {
  const [progress, setProgress] = useState(0);

  const uploadVideo = async (file, onProgress) => {
    const fileName = `${Date.now()}-${file.name}`;
    const url = `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${fileName}`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "Authorization": "Basic " + btoa(`${R2_ACCESS_KEY_ID}:${R2_SECRET_ACCESS_KEY}`),
        },
        body: file,
      });

      if (!response.ok) throw new Error("Upload failed");

      onProgress && onProgress(100);
      return `${R2_CUSTOM_DOMAIN}/${fileName}`;
    } catch (err) {
      console.error("R2 Upload Error:", err);
      return null;
    }
  };

  return { uploadVideo, progress, setProgress };
};