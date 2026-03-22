import React, { useState } from "react";
import { API_BASE } from "../api/api";

const CoverPicUploader = ({ onUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const token = localStorage.getItem("token");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("cover", file); // backend field

      const res = await fetch(`${API_BASE}/api/users/cover-pic`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      console.log("Cover pic URL:", data.url);
      onUploaded && onUploaded(data.url);

      setFile(null);
      alert("Cover photo uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-2">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button
        type="submit"
        disabled={uploading}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {uploading ? "Uploading..." : "Upload Cover Photo"}
      </button>
    </form>
  );
};

export default CoverPicUploader;