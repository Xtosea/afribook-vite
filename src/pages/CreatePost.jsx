// src/pages/CreatePost.jsx
import { useState } from "react";
import axios from "axios";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  /* ================= HANDLE FILE SELECTION ================= */
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(files);

    // Generate previews
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  /* ================= UPLOAD AND CREATE POST ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content && mediaFiles.length === 0) return alert("Add text or media");

    const formData = new FormData();
    formData.append("content", content);

    mediaFiles.forEach((file) => formData.append("media", file));

    try {
      setLoading(true);
      const res = await axios.post(
        "https://afribook-backend.onrender.com/api/posts",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Post created:", res.data);
      alert("Post created successfully!");

      // Reset
      setContent("");
      setMediaFiles([]);
      setPreviewUrls([]);
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      alert("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-2">Create Post</h2>

      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border rounded mb-2"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <input
          type="file"
          multiple
          onChange={handleFilesChange}
          className="mb-2"
        />

        {/* Media Previews */}
        {previewUrls.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {previewUrls.map((url, idx) => (
              <div key={idx} className="w-24 h-24 border rounded overflow-hidden">
                {mediaFiles[idx].type.startsWith("video") ? (
                  <video src={url} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={url} alt="preview" className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
}