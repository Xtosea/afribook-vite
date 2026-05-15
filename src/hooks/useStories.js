import { useState } from "react";

import axios from "axios";

import { API_BASE } from "../api/api";

export function useStoryUpload() {

  const [loading, setLoading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const uploadStory =
    async (file) => {

      try {

        setLoading(true);

        /* GET SIGNED URL */

        const signedRes =
          await fetch(
            `${API_BASE}/api/r2/signed-url?contentType=${file.type}`
          );

        const signedData =
          await signedRes.json();

        /* UPLOAD TO R2 */

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
                    (
                      event.loaded *
                      100
                    ) /
                      event.total
                  );

                setProgress(
                  percent
                );
              },
          }
        );

        /* SAVE STORY */

        const token =
          localStorage.getItem(
            "token"
          );

        const mediaType =
          file.type.startsWith(
            "video"
          )
            ? "video"
            : "image";

        const res =
          await fetch(
            `${API_BASE}/api/stories`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify(
                {
                  media: [
                    {
                      url:
                        signedData.fileUrl,

                      type:
                        mediaType,
                    },
                  ],
                }
              ),
            }
          );

        return await res.json();

      } catch (err) {

        console.error(
          err
        );

        throw err;

      } finally {

        setLoading(false);
      }
    };

  return {
    uploadStory,
    loading,
    progress,
  };
}