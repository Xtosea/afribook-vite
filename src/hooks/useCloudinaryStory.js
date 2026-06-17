import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE;

export const useCloudinaryStoryUpload = () => {
  const [loading, setLoading] = useState(false);

  const uploadStoryMedia = async (file) => {
    try {
      setLoading(true);

      const formData = new FormData();

      // IMPORTANT: must match multer.single("image")
      formData.append("image", file);

      const res = await fetch(
        `${API_BASE}/api/storyCloudinary/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const raw = await res.text();
      const data = JSON.parse(raw);

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      return data.url; // Cloudinary URL
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadStoryMedia, loading };
};