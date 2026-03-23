// src/components/MediaUpload.jsx
import React, { useRef, useState } from "react";
import { FiUpload } from "react-icons/fi";

const MAX_FILES = 5;

const MediaUpload = ({ mediaFiles, setMediaFiles, uploadProgress }) => {
  const fileInputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    let newFiles = Array.from(files);

    let combined = [...mediaFiles, ...newFiles];

    if (combined.length > MAX_FILES) {
      alert(`Max ${MAX_FILES} files allowed`);
      combined = combined.slice(0, MAX_FILES);
    }

    setMediaFiles(combined);
  };

  const removeFile = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Upload Box */}
      <div
        onClick={() => fileInputRef.current.click()}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center ${
          dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <FiUpload className="mx-auto text-2xl mb-2" />
        <p className="text-sm text-gray-600">Click or drag media here</p>
      </div>

      {/* Preview */}
      {mediaFiles.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {mediaFiles.map((file, i) => (
            <div key={i} className="relative w-24">

              {/* Remove */}
              <button
                onClick={() => removeFile(i)}
                className="absolute -top-2 -right-2 bg-black text-white w-6 h-6 rounded-full text-xs z-10"
              >
                ✕
              </button>

              {/* Preview */}
              {file.type.startsWith("image") ? (
                <img
                  src={URL.createObjectURL(file)}
                  className="w-24 h-24 object-cover rounded"
                />
              ) : (
                <video
                  src={URL.createObjectURL(file)}
                  className="w-24 h-24 object-cover rounded"
                  muted
                />
              )}

              {/* Progress Bar */}
              {uploadProgress[i] >= 0 && (
                <div className="w-full bg-gray-200 h-1 mt-1 rounded">
                  <div
                    className="bg-blue-500 h-1 rounded"
                    style={{ width: `${uploadProgress[i] || 0}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;