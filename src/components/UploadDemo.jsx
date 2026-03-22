import React, { useState } from "react";
import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";

export default function UploadDemo() {
  const [file, setFile] = useState(null);
  const { uploadImage, loading, url, error } = useCloudinaryUpload();

  const handleChange = (e) => setFile(e.target.files[0]);
  const handleUpload = () => file && uploadImage(file);

  return (
    <div>
      <input type="file" onChange={handleChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
      {url && <img src={url} alt="Uploaded" style={{ width: 200 }} />}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}