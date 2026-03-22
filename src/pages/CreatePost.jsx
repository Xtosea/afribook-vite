import React, { useState } from "react";
import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
// (Optional) import { useR2Upload } from "../hooks/useR2Upload";

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [type, setType] = useState("image"); // image | video

  const { uploadImage, loading, url, error } = useCloudinaryUpload();

  // OPTIONAL for video later
  // const { uploadVideo, videoUrl } = useR2Upload();

  const token = localStorage.getItem("token");

  /* ================= HANDLE FILE ================= */
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);

    // auto-detect type
    if (selected.type.startsWith("video")) {
      setType("video");
    } else {
      setType("image");
    }
  };

  /* ================= UPLOAD ================= */
  const handleUpload = async () => {
    if (!file) return alert("Select a file first");

    if (type === "image") {
      await uploadImage(file);
    }

    // Uncomment when R2 hook is ready
    /*
    if (type === "video") {
      await uploadVideo(file);
    }
    */
  };

  /* ================= SUBMIT POST ================= */
  const handleSubmit = async () => {
    const mediaUrl = url; // or videoUrl when using R2

    if (!mediaUrl) {
      return alert("Upload media first");
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            caption,
            media: mediaUrl,
            type, // image or video
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert("Post created!");

      // Reset
      setFile(null);
      setCaption("");
      window.location.href = "/"; // go to feed
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <h2>Create Post</h2>

      {/* FILE INPUT */}
      <input type="file" onChange={handleFileChange} />

      {/* PREVIEW */}
      {file && (
        <div style={{ marginTop: 10 }}>
          {type === "image" ? (
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              style={{ width: "100%" }}
            />
          ) : (
            <video
              src={URL.createObjectURL(file)}
              controls
              style={{ width: "100%" }}
            />
          )}
        </div>
      )}

      {/* CAPTION */}
      <textarea
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        style={{ width: "100%", marginTop: 10 }}
      />

      {/* UPLOAD BUTTON */}
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload Media"}
      </button>

      {/* SUBMIT BUTTON */}
      <button onClick={handleSubmit} style={{ marginLeft: 10 }}>
        Post
      </button>

      {/* RESULT */}
      {url && (
        <p style={{ color: "green" }}>✅ Media uploaded successfully</p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}