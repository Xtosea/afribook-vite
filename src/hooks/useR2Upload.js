// src/hooks/useR2Upload.js
import { useState } from "react";

export const useR2Upload = () => {
  const [progress, setProgress] = useState(0);

  const R2_CUSTOM_DOMAIN = import.meta.env.VITE_R2_CUSTOM_DOMAIN;
  const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME;
  const R2_ENDPOINT = import.meta.env.VITE_R2_ENDPOINT;
  const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID;
  const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;

  const uploadVideo = async (file, onProgress) => {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const url = `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${fileName}`;

      const headers = {
        "Content-Type": file.type,
        "Authorization":
          "Basic " +
          btoa(`${R2_ACCESS_KEY_ID}:${R2_SECRET_ACCESS_KEY}`),
      };

      // Browser fetch doesn’t support upload progress by default.
      // If you want progress, you can use XMLHttpRequest instead:
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.setRequestHeader(
          "Authorization",
          "Basic " + btoa(`${R2_ACCESS_KEY_ID}:${R2_SECRET_ACCESS_KEY}`)
        );

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setProgress(percent);
            if (onProgress) onProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error(`R2 upload failed: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error("R2 upload failed"));
        xhr.send(file);
      });

      // Return public URL using custom domain
      const publicUrl = `${R2_CUSTOM_DOMAIN}/${fileName}`;
      return publicUrl;
    } catch (err) {
      console.error("R2 UPLOAD ERROR:", err);
      return null;
    }
  };

  return { uploadVideo, progress };
};