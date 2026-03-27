import React, { useRef, useState } from "react";
import { API_BASE } from "../../api/api";

const ReelUpload = () => {
  const fileRef = useRef();
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("video", file);
    form.append("caption", caption);

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found!");
      return;
    }

    setUploading(true);

    // Log and validate API_BASE
    const uploadUrl = `${API_BASE}/api/reels/upload`;
    console.log("Uploading to:", uploadUrl);

    try {
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      // Always read as text first to check for HTML errors
      const text = await res.text();

      // Quick check if response looks like HTML
      if (text.trim().startsWith("<")) {
        console.error(
          "⚠️ Received HTML instead of JSON. Likely wrong API_BASE or server error.",
          text
        );
        return;
      }

      // Try parsing JSON safely
      let data = null;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Failed to parse JSON response:", text);
      }

      if (!res.ok) {
        console.error("Upload failed:", data || text);
      } else {
        console.log("Upload successful:", data);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setCaption("");
      e.target.value = null; // reset file input
      setUploading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4">
      {/* Caption Input */}
      <input
        placeholder="Write caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="mb-2 p-2 rounded-lg shadow"
      />

      {/* Upload Button */}
      <div
        onClick={() => fileRef.current.click()}
        className="bg-white text-black w-14 h-14 rounded-full flex items-center justify-center shadow-xl cursor-pointer"
      >
        {uploading ? "⏳" : "🎬"}
      </div>

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