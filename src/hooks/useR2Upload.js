import { API_BASE } from "../api/api";
import generateThumbnail from "../utils/generateThumbnail";

export const useR2Upload = () => {

  const uploadVideo = async (file) => {

    // ================= FILE SIZE LIMIT =================
    // 200MB MAX
    if (file.size > 200 * 1024 * 1024) {
      throw new Error(
        "Video too large. Max 200MB"
      );
    }

    // ================= GET SIGNED URL =================
    const res = await fetch(
      `${API_BASE}/api/r2/signed-url?contentType=${encodeURIComponent(file.type)}`
    );

    console.log(
      "SIGNED URL RESPONSE STATUS:",
      res.status
    );

    const data = await res.json();

    console.log(
      "SIGNED URL DATA:",
      data
    );

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

    console.log(
      "UPLOAD STATUS:",
      uploadRes.status
    );

    const uploadText =
      await uploadRes.text();

    console.log(
      "UPLOAD RESPONSE:",
      uploadText
    );

    if (!uploadRes.ok) {
      throw new Error(
        "R2 upload failed"
      );
    }

const thumbnailBlob =
  await generateThumbnail(file);

    // ================= RETURN PUBLIC URL =================
    return {
  videoUrl: data.fileUrl,
  thumbnailBlob,
};

  return { uploadVideo };
};