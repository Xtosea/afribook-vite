import { useState } from "react";

export const useCloudinaryUpload = () => {
  const [loading, setLoading] = useState(false);

  const uploadImage = async (file) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        import.meta.env.VITE_CLOUDINARY_UPLOAD_URL,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadImage, loading };
};