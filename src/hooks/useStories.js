import { useState } from "react";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE;

export const useStoryUpload = () => {
  const [loading, setLoading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const uploadStory = async ({
    file,
    text = "",
    music = null,
    stickers = [],
    backgroundColor = "#000000",
  }) => {
    try {
      setLoading(true);

      let media = [];

      // =========================
      // MEDIA UPLOAD (OPTIONAL)
      // =========================
      if (file) {
        const signedRes = await fetch(
          `${API_BASE}/api/r2/signed-url?contentType=${file.type}`
        );

        const signedData =
          await signedRes.json();

        if (
          !signedData.uploadUrl ||
          !signedData.fileUrl
        ) {
          throw new Error(
            "Invalid signed URL response"
          );
        }

        await axios.put(
          signedData.uploadUrl,
          file,
          {
            headers: {
              "Content-Type": file.type,
            },

            onUploadProgress: (
              event
            ) => {
              const percent =
                Math.round(
                  (event.loaded * 100) /
                    event.total
                );

              setProgress(percent);
            },
          }
        );

        media = [
          {
            url: signedData.fileUrl,
            type:
              file.type.startsWith(
                "video"
              )
                ? "video"
                : "image",
          },
        ];
      }

      // =========================
      // SAVE STORY
      // =========================
      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/stories`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            media,

            text,

            music,

            stickers,

            backgroundColor,
          }),
        }
      );

      const story =
        await res.json();

      if (!res.ok) {
        throw new Error(
          story.error ||
            "Failed to create story"
        );
      }

      return story;
    } catch (err) {
      console.error(
        "Story upload error:",
        err
      );

      throw err;
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return {
    uploadStory,
    loading,
    progress,
  };
};