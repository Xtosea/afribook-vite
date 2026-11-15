import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../api/api";

export function use2Upload() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFile = async (file) => {
    let uploadStage = "initialization";

    try {
      setLoading(true);
      setProgress(0);
      setError(null);

      if (!file) {
        throw new Error("No file selected");
      }

      if (!file.type) {
        throw new Error("File type could not be identified");
      }

      if (!API_BASE) {
        throw new Error("API base URL is not configured");
      }

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }

      // Request an authenticated Reel upload URL.
      uploadStage = "requesting_signed_url";
      const signedRes = await fetch(
        `${API_BASE}/api/r2/video-signed-url?contentType=${encodeURIComponent(file.type)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseText = await signedRes.text();
      let signedData;

      try {
        signedData = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Invalid signed URL response (HTTP ${signedRes.status})`
        );
      }

      if (!signedRes.ok || !signedData.success) {
        throw new Error(
          signedData.error ||
          signedData.message ||
          `Failed to get upload URL (HTTP ${signedRes.status})`
        );
      }

      if (!signedData.uploadUrl || !signedData.fileUrl) {
        throw new Error("Server returned an incomplete upload URL");
      }

      // Upload directly to Cloudflare R2.
      const uploadTarget = new URL(signedData.uploadUrl);
      console.info("Reel R2 upload target:", {
        hostname: uploadTarget.hostname,
        contentType: file.type,
        fileSize: file.size,
      });

      uploadStage = "uploading_to_r2";
      const uploadRes = await axios.put(
        signedData.uploadUrl,
        file,
        {
          headers: {
            "Content-Type": file.type,
          },
          onUploadProgress: (event) => {
            if (event.total) {
              const percent = Math.round(
                (event.loaded * 100) / event.total
              );
              setProgress(percent);
            }
          },
        }
      );

      if (
        uploadRes.status !== 200 &&
        uploadRes.status !== 204
      ) {
        throw new Error("File upload to R2 failed");
      }

      setProgress(100);

      return {
        videoUrl: signedData.fileUrl,
      };
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Reel upload failed";

      console.error("Reel media upload failed:", {
        stage: uploadStage,
        message,
        code: err.code || null,
        httpStatus: err.response?.status || null,
        responseData: err.response?.data || null,
      });
      setError(message);

      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadFile,
    loading,
    progress,
    error,
  };
}