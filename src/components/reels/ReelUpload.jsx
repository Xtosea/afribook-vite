import React, { useRef, useState } from "react";
import { API_BASE } from "../../api/api";
import { getSocket } from "../../socket"; // optional

const ReelUpload = () => {
  const fileRef = useRef();
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(""); // simple user feedback

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("video", file);
    form.append("caption", caption);

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found!");
      setMessage("⚠ You must be logged in to upload");
      return;
    }

    setUploading(true);
    setMessage("Uploading...");

    const uploadUrl = `${API_BASE}/api/reels/upload`;
    console.log("Uploading to:", uploadUrl);

    try {
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const text = await res.text();

      if (text.trim().startsWith("<")) {
        console.error(
          "⚠️ Received HTML instead of JSON. Likely wrong API_BASE or server error.",
          text
        );
        setMessage("⚠ Server error. Check console.");
        return;
      }

      let data = null;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Failed to parse JSON response:", text);
        setMessage("⚠ Invalid response from server");
        return;
      }

      if (!res.ok) {
        console.error("Upload failed:", data);
        setMessage(data?.message || "Upload failed");
      } else {
        console.log("Upload successful:", data);
        setMessage("Upload successful ✅");

        // Optional: notify Reels page via socket
        const socket = getSocket();
        if (socket) socket.emit("new-reel-uploaded", data);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("⚠ Network error");
    } finally {
      setCaption("");
      e.target.value = null;
      setUploading(false);

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 flex flex-col items-center">
      {/* Caption Input */}
      <input
        placeholder="Write caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="mb-2 p-2 rounded-lg shadow w-48"
      />

      {/* Upload Button */}
      <div
        onClick={() => !uploading && fileRef.current.click()}
        className={`bg-white text-black w-14 h-14 rounded-full flex items-center justify-center shadow-xl cursor-pointer ${
          uploading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {uploading ? "⏳" : "🎬"}
      </div>

      {/* Feedback Message */}
      {message && (
        <div className="mt-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
          {message}
        </div>
      )}

      {/* Hidden File Input */}
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