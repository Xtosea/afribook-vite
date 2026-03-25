// src/components/StoryUploader.jsx
import React, { useState } from "react";
import { useStoryUpload } from "../hooks/useStoryUpload";

const StoryUploader = () => {
  const [files, setFiles] = useState([]);
  const { uploadStory, loading, error } = useStoryUpload();

  const handleFileChange = (e) => setFiles([...e.target.files]);

  const handleUpload = async () => {
    if (files.length === 0) return;
    const story = await uploadStory(files);
    if (story) {
      alert("Story uploaded successfully!");
      setFiles([]);
    }
  };

  return (
    <div className="p-3 border rounded space-y-2">
      <input
        type="file"
        accept="video/*,image/*"
        multiple
        onChange={handleFileChange}
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-3 py-1 rounded"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload Story"}
      </button>
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
      {files.length > 0 && (
        <div className="flex space-x-2 mt-2">
          {files.map((file, i) => (
            <p key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
              {file.name}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoryUploader;