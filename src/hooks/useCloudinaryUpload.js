// src/hooks/useCloudinaryUpload.js
import { useState } from "react";
import { API_BASE } from "../api/api";

export const useCloudinaryUpload = () => {
  const [error, setError] = useState(null);

  const uploadImage = async (file, onProgress) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "YOUR_UPLOAD_PRESET"); // Set in Cloudinary

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Cloudinary upload failed");

      const data = await res.json();
      return data.secure_url; // final image URL
    } catch (err) {
      setError(err);
      console.error("Cloudinary Upload Error:", err);
      return null;
    }
  };

  return { uploadImage, error };
};