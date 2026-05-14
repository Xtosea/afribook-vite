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
    const urls = (mediaFiles || []).map((file) => {
      if (file instanceof File) {
        return URL.createObjectURL(file);
      }
      return null;
    });

    setPreviewUrls(urls);

    // Cleanup memory leaks
    return () => {
      urls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
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
    <div className="space-y-4">

      {/* =========================
          DROP AREA (FACEBOOK STYLE)
      ========================= */}
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
        className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
          dragging
            ? "border-blue-500 bg-blue-50 scale-[1.01]"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
      >
        <FiUpload className="mx-auto text-3xl mb-3 text-blue-500" />

        <p className="text-base font-semibold text-gray-700">
          Add Photos or Videos
        </p>

        <p className="text-sm text-gray-400 mt-1">
          Click or drag & drop to upload (max {MAX_FILES})
        </p>
      </div>

      {/* =========================
          PREVIEW GRID (BIGGER UI)
      ========================= */}
      {mediaFiles?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {mediaFiles.map((file, i) => {
            const preview = previewUrls[i];

            return (
              <div
                key={i}
                className="relative group rounded-xl overflow-hidden shadow-md bg-black"
              >
                {/* REMOVE BUTTON */}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-2 right-2 bg-black/70 text-white w-7 h-7 rounded-full text-sm opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>

                {/* MEDIA */}
                {file.type.startsWith("image") ? (
                  <img
                    src={preview}
                    className="w-full h-40 object-cover"
                    alt=""
                  />
                ) : (
                  <video
                    src={preview}
                    className="w-full h-40 object-cover"
                    muted
                  />
                )}

                {/* UPLOAD PROGRESS OVERLAY */}
                {uploadProgress?.[i] >= 0 && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                    <div className="text-sm font-medium">
                      Uploading...
                    </div>

                    <div className="w-3/4 h-2 bg-gray-700 rounded mt-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${uploadProgress[i] || 0}%`,
                        }}
                      />
                    </div>

                    <div className="text-xs mt-1">
                      {uploadProgress[i] || 0}%
                    </div>
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