import { useState } from "react";

export const useR2Upload = () => {
  const [loading, setLoading] = useState(false);

  const uploadVideo = async (file) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("video", file);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/videos/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadVideo, loading };
};