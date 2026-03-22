// src/hooks/useR2Upload.js
import { R2_CUSTOM_DOMAIN, R2_BUCKET_NAME, R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } from "../config"; // or process.env

export const useR2Upload = () => {
  const uploadVideo = async (file) => {
    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;

      // Prepare FormData for direct upload to R2 (S3 API compatible)
      const formData = new FormData();
      formData.append("file", file);

      // Backend endpoint to handle upload
      // You can create an endpoint like /api/upload-video that signs the request or directly uploads via AWS SDK
      const res = await fetch(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${filename}`, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "Authorization": `Basic ${btoa(`${R2_ACCESS_KEY_ID}:${R2_SECRET_ACCESS_KEY}`)}`,
        },
        body: file,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      // Return the full URL via your custom domain
      return `${R2_CUSTOM_DOMAIN}/${filename}`;
    } catch (err) {
      console.error("R2 VIDEO UPLOAD ERROR:", err);
      return null;
    }
  };

  return { uploadVideo };
};