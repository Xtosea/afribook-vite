import { API_BASE } from "../api/api";
import generateThumbnail from "../utils/generateThumbnail";

export const useR2Upload = () => {
  const uploadVideo = async (file, token) => {
    // ================= FILE VALIDATION =================

    if (!file) {
      throw new Error("No video file selected");
    }

    if (file.size > 200 * 1024 * 1024) {
      throw new Error("Video too large. Max 200MB");
    }

    if (!file.type?.startsWith("video/")) {
      throw new Error(`Unsupported video type: ${file.type || "unknown"}`);
    }

    if (!token) {
      throw new Error("Authentication token missing");
    }

    // ================= START THUMBNAIL EARLY =================

    // Generate the thumbnail while the signed-URL request and
    // video upload are in progress. Thumbnail failure is non-fatal.
    console.log("🖼️ Starting video thumbnail generation...");

    const thumbnailPromise = generateThumbnail(file).catch((error) => {
      console.warn("Video thumbnail generation failed:", error);
      return null;
    });

    // ================= GET SIGNED URL =================

    const signedUrlEndpoint =
      `${API_BASE}/api/r2/video-signed-url?contentType=${encodeURIComponent(
        file.type
      )}`;

    console.log("🎬 R2 VIDEO SIGNED URL REQUEST:", signedUrlEndpoint);

    const res = await fetch(signedUrlEndpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const responseText = await res.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(
        "❌ R2 signed URL returned non-JSON:",
        responseText
      );

      throw new Error(
        `R2 signed URL request failed (${res.status})`
      );
    }

    if (!res.ok) {
      console.error(
        "❌ R2 SIGNED URL ERROR:",
        res.status,
        data
      );

      throw new Error(
        data?.error ||
          data?.message ||
          `R2 signed URL request failed (${res.status})`
      );
    }

    if (!data.uploadUrl || !data.fileUrl) {
      console.error(
        "❌ Invalid R2 signed URL response:",
        data
      );

      throw new Error("Invalid R2 upload response");
    }

    // ================= UPLOAD DIRECTLY TO R2 =================

    console.log("☁️ Uploading video directly to R2...");

    const uploadRes = await fetch(data.uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadRes.ok) {
      const uploadError = await uploadRes.text().catch(() => "");

      console.error(
        "❌ R2 VIDEO UPLOAD FAILED:",
        uploadRes.status,
        uploadError
      );

      throw new Error(
        `R2 video upload failed (${uploadRes.status})`
      );
    }

    console.log("✅ Video uploaded to R2:", data.fileUrl);

    // ================= GET THUMBNAIL RESULT =================

    // Thumbnail generation has been running during the upload.
    const thumbnailBlob = await thumbnailPromise;

    // ================= RETURN VIDEO + THUMB =================

    return {
      videoUrl: data.fileUrl,
      thumbnailBlob,
    };
  };

  return { uploadVideo };
};