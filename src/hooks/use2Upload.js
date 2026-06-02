import { useState } from "react";
import axios from "axios";
import generateThumbnail from "../utils/generateThumbnail";

const API_BASE =
  import.meta.env.VITE_API_BASE;

export function use2Upload() {

  const [loading, setLoading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [error, setError] =
    useState(null);

  const uploadFile = async (file) => {

    try {

      setLoading(true);
      setProgress(0);

      const signedRes =
        await fetch(
          `${API_BASE}/api/r2/signed-url?contentType=${file.type}`
        );

      const signedData =
        await signedRes.json();

      await axios.put(
        signedData.uploadUrl,
        file,
        {
          headers: {
            "Content-Type":
              file.type,
          },

          onUploadProgress:
            (event) => {

              const percent =
                Math.round(
                  (event.loaded *
                    100) /
                    event.total
                );

              setProgress(
                percent
              );
            },
        }
      );

      const thumbnailBlob =
        await generateThumbnail(
          file
        );

      return {
        videoUrl:
          signedData.fileUrl,
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