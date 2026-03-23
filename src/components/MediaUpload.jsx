// src/components/MediaUpload.jsx
import React, { useRef } from "react";
import { FiUpload } from "react-icons/fi";

const MediaUpload = ({ mediaFiles, setMediaFiles }) => {
  const fileInputRef = useRef();

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleMediaChange}
        className="border p-2 rounded w-full"
      />

      {mediaFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {mediaFiles.map((file, i) => (
            <div key={i} className="relative">
              {file.type.startsWith("image") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded"
                />
              ) : (
                <video
                  src={URL.createObjectURL(file)}
                  className="w-24 h-24 object-cover rounded"
                  muted
                  controls
                />
              )}
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;