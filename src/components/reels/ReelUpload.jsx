import React, { useRef, useState } from "react";
import { API_BASE } from "../../api/api";
import { safeEmit, getSocket } from "../../socket";

const ReelUpload = () => {
  const fileRef = useRef();

  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const upload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // ================= CHECK VIDEO DURATION =================

    const video = document.createElement("video");

    video.preload = "metadata";

    video.onloadedmetadata = async () => {

      window.URL.revokeObjectURL(video.src);

      // 60 seconds limit
      if (video.duration > 60) {
        setMessage("⚠ Reel must not exceed 60 seconds");
        return;
      }

      // ================= START UPLOAD =================

      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("⚠ Login required");
        return;
      }

      const form = new FormData();

      form.append("video", file);
      form.append("caption", caption);

      setUploading(true);

      setMessage("Uploading reel...");

      try {

        const res = await fetch(
          `${API_BASE}/api/posts/reels/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: form,
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.error(data);

          setMessage(data.error || "Upload failed");

          return;
        }

        console.log("UPLOAD SUCCESS:", data);

        setMessage("✅ Reel uploaded");

        const socket = getSocket();

        if (socket) {
          safeEmit("new-reel-uploaded", data);
        }

      } catch (err) {

        console.error(err);

        setMessage("⚠ Upload error");

      } finally {

        setUploading(false);

        setCaption("");

        e.target.value = null;

        setTimeout(() => {
          setMessage("");
        }, 3000);

      }
    };

    video.src = URL.createObjectURL(file);
  };

  return (
    <div className="fixed bottom-24 right-4 flex flex-col items-center z-50">

      <input
        placeholder="Write caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="mb-2 p-2 rounded-lg shadow w-52 border"
      />

      <button
        onClick={() => !uploading && fileRef.current.click()}
        className={`w-14 h-14 rounded-full shadow-xl text-2xl bg-white ${
          uploading ? "opacity-50" : ""
        }`}
      >
        {uploading ? "⏳" : "🎬"}
      </button>

      {message && (
        <div className="mt-2 bg-black text-white px-3 py-1 rounded text-sm">
          {message}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={upload}
      />

    </div>
  );
};

export default ReelUpload;