import { useState } from "react";
import { API_BASE } from "../api/api";
import { useR2Upload } from "./useR2Upload"; // your existing R2 upload hook

export const useStoryUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { uploadVideo } = useR2Upload(); // R2 upload function

  const uploadStory = async (file) => {
    if (!file) return null;
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Upload to R2
      const url = await uploadVideo(file);

      if (!url) throw new Error("R2 upload failed");

      // 2️⃣ Create story in backend
      const token = localStorage.getItem("token");
      const type = file.type.startsWith("video") ? "video" : "image";

      const res = await fetch(`${API_BASE}/api/stories/upload-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url, type }),
      });

      const data = await res.json();

      if (!res.ok || !data?._id) throw new Error(data?.error || "Story creation failed");

      setLoading(false);
      return data; // return the created story
    } catch (err) {
      console.error("Story upload error:", err);
      setError(err);
      setLoading(false);
      return null;
    }
  };

  return { uploadStory, loading, error };
};