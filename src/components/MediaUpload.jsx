// src/components/MediaUpload.jsx

import React, { useRef, useState, useEffect } from "react";
import { FiUpload } from "react-icons/fi";

const MAX_FILES = 5;

const MediaUpload = ({
  mediaFiles = [],
  setMediaFiles = () => {},
  uploadProgress = [],
}) => {
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  // =========================
  // Generate Preview URLs
  // =========================
  useEffect(() => {
    const urls = (mediaFiles || []).map((file) =>
      file instanceof File ? URL.createObjectURL(file) : null
    );

    setPreviewUrls(urls);

    // Cleanup memory
    return () => {
      urls.forEach((url) => url && URL.revokeObjectURL(url));
    };
  }, [mediaFiles]);

  // =========================
  // Handle Files
  // =========================
  const handleFiles = (files) => {
    if (!files) return;

    const newFiles = Array.from(files);
    let combined = [...(mediaFiles || []), ...newFiles];

    if (combined.length > MAX_FILES) {
      alert(`Max ${MAX_FILES} files allowed`);
      combined = combined.slice(0, MAX_FILES);
    }

    setMediaFiles(combined);
  };

  // =========================
  // Remove File
  // =========================
  const removeFile = (index) => {
    setMediaFiles((prev = []) =>
      prev.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-3">

      {/* FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = null;
        }}
        className="hidden"
      />

      {/* DROP AREA */}
      <div
        onClick={() => fileInputRef.current?.click()}
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
          dragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300"
        }`}
      >
        <FiUpload className="mx-auto text-2xl mb-2" />
        <p className="text-sm text-gray-600">
          Click or drag media here
        </p>
      </div>

      {/* PREVIEW */}
      {mediaFiles?.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-2">
          {mediaFiles.map((file, i) => {
            const preview = previewUrls[i];

            return (
              <div
                key={i}
                className="relative w-24 h-24"
              >
                {/* REMOVE BUTTON */}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -top-2 -right-2 bg-black text-white w-6 h-6 rounded-full text-xs z-10"
                >
                  ✕
                </button>

                {/* MEDIA */}
                {file instanceof File && (
                  file.type.startsWith("image") ? (
                    <img
                      src={preview}
                      className="w-24 h-24 object-cover rounded"
                      alt=""
                    />
                  ) : (
                    <video
                      src={preview}
                      className="w-24 h-24 object-cover rounded"
                      muted
                    />
                  )
                )}

                {/* UPLOAD PROGRESS */}
                {uploadProgress &&
                  uploadProgress[i] >= 0 && (
                    <div className="w-full bg-gray-200 h-1 mt-1 rounded">
                      <div
                        className="bg-blue-500 h-1 rounded"
                        style={{
                          width: `${
                            uploadProgress[i] || 0
                          }%`,
                        }}
                      />
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;