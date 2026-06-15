import { API_BASE } from "../api/api";
import generateThumbnail from "../utils/generateThumbnail";

export const useR2Upload = () => {

  const uploadVideo = async (file) => {

    // ================= FILE SIZE LIMIT =================
    if (file.size > 200 * 1024 * 1024) {
      throw new Error(
        "Video too large. Max 200MB"
      );
    }

    // ================= GET SIGNED URL =================
    const res = await fetch(
      `${API_BASE}/api/r2storymusic/signed-url?contentType=${encodeURIComponent(file.type)}`
    );

    const data = await res.json();

    // ================= UPLOAD TO R2 =================
    const uploadRes = await fetch(
      data.uploadUrl,
      {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      }
    );

    if (!uploadRes.ok) {
      throw new Error(
        "R2 upload failed"
      );
    }

    // ================= GENERATE THUMBNAIL =================
    const thumbnailBlob =
      await generateThumbnail(file);

    // ================= RETURN VIDEO + THUMB =================
    return {
      videoUrl: data.fileUrl,
      thumbnailBlob,
    };
  };

  return { uploadVideo };
};