import { API_BASE } from "../api/api";

export const useR2Upload = () => {
  const uploadVideo = async (file, onProgress) => {
    const formData = new FormData();
    formData.append("video", file); // MUST match backend

    const res = await fetch(`${API_BASE}/api/r2/upload-video`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Upload failed");
    }

    return data.uploaded[0].url; // return first file
  };

  return { uploadVideo };
};