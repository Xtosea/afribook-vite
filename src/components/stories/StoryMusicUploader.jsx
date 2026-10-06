import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../../api/api";

export default function StoryMusicUploader() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audio, setAudio] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadMusic = async () => {
    console.log("[StoryMusic] ===== UPLOAD START =====");

    try {
      if (!audio) {
        console.error("[StoryMusic] STEP 0 FAILED: No audio selected");
        alert("Select an audio file");
        return;
      }

      setLoading(true);

      console.log("[StoryMusic] File:", {
        name: audio.name,
        type: audio.type,
        size: audio.size,
        sizeMB: (audio.size / 1024 / 1024).toFixed(2),
      });

      const token = localStorage.getItem("token");

      console.log("[StoryMusic] Token exists:", Boolean(token));

      if (!token) {
        throw new Error("Authentication required");
      }

      // ============================================================
      // STEP 2: UPLOAD AUDIO THROUGH AFRICSOCIAL WORKER
      // ============================================================

      console.log("[StoryMusic] STEP 2: Uploading audio through Worker");

      let uploadData = {};

      try {
        const uploadUrl = `${API_BASE}/api/r2/story-music-upload`;

        console.log("[StoryMusic] STEP 2 URL:", uploadUrl);

        const uploadResponse = await axios.put(
          uploadUrl,
          audio,
          {
            headers: {
              "Content-Type": audio.type,
              Authorization: `Bearer ${token}`,
            },

            // Prevent Axios from transforming the File object.
            transformRequest: [
              (data) => data,
            ],

            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percent = Math.round(
                  (progressEvent.loaded / progressEvent.total) * 100
                );

                console.log(
                  `[StoryMusic] STEP 2 upload progress: ${percent}%`
                );
              }
            },
          }
        );

        console.log(
          "[StoryMusic] STEP 2 HTTP status:",
          uploadResponse.status
        );

        uploadData = uploadResponse.data;

        console.log(
          "[StoryMusic] STEP 2 response body:",
          uploadData
        );

        if (!uploadResponse.data?.success || !uploadResponse.data?.fileUrl) {
          throw new Error(
            uploadResponse.data?.error ||
              "Worker did not return an uploaded file URL"
          );
        }

        console.log(
          "[StoryMusic] STEP 2 SUCCESS: Audio uploaded to R2 through Worker"
        );

        console.log(
          "[StoryMusic] R2 file URL:",
          uploadResponse.data.fileUrl
        );
      } catch (error) {
        console.error(
          "[StoryMusic] STEP 2 FAILED: Worker R2 upload error"
        );

        console.error(
          "[StoryMusic] STEP 2 error name:",
          error?.name
        );

        console.error(
          "[StoryMusic] STEP 2 error message:",
          error?.message
        );

        console.error(
          "[StoryMusic] STEP 2 error code:",
          error?.code
        );

        console.error(
          "[StoryMusic] STEP 2 request URL:",
          error?.config?.url
        );

        console.error(
          "[StoryMusic] STEP 2 request method:",
          error?.config?.method
        );

        console.error(
          "[StoryMusic] STEP 2 response status:",
          error?.response?.status
        );

        console.error(
          "[StoryMusic] STEP 2 response data:",
          error?.response?.data
        );

        console.error(
          "[StoryMusic] STEP 2 response headers:",
          error?.response?.headers
        );

        throw new Error(
          `STEP 2 failed: ${
            error?.response?.data?.error ||
            error?.message ||
            "Worker R2 upload error"
          }`
        );
      }

      // ============================================================
      // STEP 3: SAVE STORY MUSIC RECORD
      // ============================================================

      console.log(
        "[StoryMusic] STEP 3: Saving Story Music record"
      );

      const saveUrl = `${API_BASE}/api/story-music-admin`;

      console.log(
        "[StoryMusic] STEP 3 URL:",
        saveUrl
      );

      let res;

      try {
        res = await fetch(saveUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            artist,
            audioUrl: uploadData.fileUrl,
          }),
        });

        console.log(
          "[StoryMusic] STEP 3 HTTP status:",
          res.status
        );
      } catch (error) {
        console.error(
          "[StoryMusic] STEP 3 NETWORK ERROR:",
          error
        );

        console.error(
          "[StoryMusic] STEP 3 error name:",
          error?.name
        );

        console.error(
          "[StoryMusic] STEP 3 error message:",
          error?.message
        );

        throw new Error(
          `STEP 3 failed: ${error?.message || "Network error"}`
        );
      }

      let data = {};

      try {
        data = await res.json();

        console.log(
          "[StoryMusic] STEP 3 response body:",
          data
        );
      } catch (error) {
        console.warn(
          "[StoryMusic] STEP 3 response was not JSON"
        );
      }

      if (!res.ok) {
        console.error(
          "[StoryMusic] STEP 3 FAILED:",
          data
        );

        throw new Error(
          data.error ||
            `Failed to save music record (HTTP ${res.status})`
        );
      }

      console.log(
        "[StoryMusic] STEP 3 SUCCESS: Music record saved"
      );

      console.log(
        "[StoryMusic] ===== UPLOAD COMPLETE ====="
      );

      alert("Music uploaded");

      setTitle("");
      setArtist("");
      setAudio(null);
    } catch (err) {
      console.error(
        "[StoryMusic] ===== UPLOAD FAILED ====="
      );

      console.error(
        "[StoryMusic] Final error:",
        err
      );

      console.error(
        "[StoryMusic] Final error name:",
        err?.name
      );

      console.error(
        "[StoryMusic] Final error message:",
        err?.message
      );

      alert(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">
        Upload Story Music
      </h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        className="border p-2 w-full mb-3"
      />

      <input
        type="text"
        placeholder="Artist"
        value={artist}
        onChange={(e) =>
          setArtist(e.target.value)
        }
        className="border p-2 w-full mb-3"
      />

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => {
          const selectedFile =
            e.target.files[0] || null;

          console.log(
            "[StoryMusic] File selected:",
            selectedFile
          );

          setAudio(selectedFile);
        }}
        className="mb-3"
      />

      <button
        onClick={uploadMusic}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}