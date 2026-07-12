import { useState } from "react";
import axios from "axios";
import generateThumbnail from "../utils/generateThumbnail";

const API_BASE = import.meta.env.VITE_API_BASE;

export function use2Upload() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFile = async (file) => {
    try {
      setLoading(true);
      setProgress(0);
      setError(null);

      const signedRes = await fetch(
        `${API_BASE}/api/r2/signed-url?contentType=${file.type}`
      );

      if (!signedRes.ok) {
        throw new Error("Failed to get signed URL");
      }

      const signedData = await signedRes.json();

//JUST FOR LOGGING ERROR 
console.log("UPLOAD URL:", signedData.uploadUrl);


      const uploadRes = await axios.put(
        signedData.uploadUrl,
        file,
        {
          headers: {
            "Content-Type": file.type,
          },
          onUploadProgress: (event) => {
            const percent = Math.round(
              (event.loaded * 100) / event.total
            );
            setProgress(percent);
          },
        }
      );

      if (
        uploadRes.status !== 200 &&
        uploadRes.status !== 204
      ) {
        throw new Error("Video upload failed");
      }

      let thumbnailBlob = null;

      try {
        thumbnailBlob =
          await generateThumbnail(file);
      } catch (err) {
        console.warn(
          "Thumbnail generation failed"
        );
      }

      return {
        videoUrl: signedData.fileUrl,
        thumbnailBlob,
      };

    } catch (err) {
      setError(err.message);
      throw err;
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