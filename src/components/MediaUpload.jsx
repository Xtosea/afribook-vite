// src/components/MediaUpload.jsx
import React, { useRef, useState, useEffect } from "react";
import { FiUpload } from "react-icons/fi";

const MAX_FILES = 5;

const MediaUpload = ({ mediaFiles, setMediaFiles, uploadProgress }) => {
  const fileInputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [previews, setPreviews] = useState([]);

  // Generate previews
  useEffect(() => {
    const newPreviews = mediaFiles.map((file) => ({
      type: file.type.startsWith("image") ? "image" : "video",
      url: URL.createObjectURL(file),
    }));
    setPreviews(newPreviews);

    // Cleanup object URLs
    return () => {
      newPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [mediaFiles]);

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
        className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition ${
          dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <FiUpload className="mx-auto text-3xl mb-2 text-gray-500" />
        <p className="text-sm text-gray-600">
          Click or drag images/videos here (max {MAX_FILES})
        </p>
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-2">
          {previews.map((p, i) => (
            <div key={i} className="relative w-full pb-full">
              {/* Remove Button */}
              <button
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 bg-black text-white w-6 h-6 rounded-full text-xs z-10 flex items-center justify-center"
              >
                ✕
              </button>

              {/* Media Preview */}
              {p.type === "image" ? (
                <img
                  src={p.url}
                  alt="preview"
                  className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                />
              ) : (
                <video
                  src={p.url}
                  className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                  muted
                  autoPlay
                  loop
                  playsInline
                />
              )}

              {/* Upload Progress */}
              {uploadProgress[i] >= 0 && (
                <div className="absolute bottom-0 left-0 w-full bg-gray-200 h-1 rounded-b-lg">
                  <div
                    className="bg-blue-500 h-1 rounded-b-lg"
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