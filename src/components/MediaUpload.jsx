// src/components/MediaUpload.jsx

import React, { useRef, useState, useEffect } from "react";
import { FiUpload } from "react-icons/fi";

const MAX_FILES = 5;

const MediaUpload = ({
  inputId,
  mediaFiles,
  setMediaFiles,
  setSelectedFile,
}) => {
  const fileInputRef = useRef(null);
  const objectUrlsRef = useRef([]);

  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadProgress] = useState({});

  // =========================
  // Generate Preview URLs
  // =========================
  useEffect(() => {
    // Cleanup old blob URLs first
    objectUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    objectUrlsRef.current = [];

    if (!mediaFiles || mediaFiles.length === 0) {
      setPreviewUrls([]);
      return;
    }

    const urls = mediaFiles.map((file) => {
      if (file instanceof File) {
        const url = URL.createObjectURL(file);
        objectUrlsRef.current.push(url);
        return url;
      }

      return file?.url || null;
    });

    setPreviewUrls(urls);

    return () => {
      objectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      objectUrlsRef.current = [];
    };
  }, [mediaFiles]);

  // =========================
  // Handle Files
  // =========================
  const handleFiles = (files) => {
    if (!files) return;

    console.log("FILES SELECTED:", files);

    const newFiles = Array.from(files);

    let combined = [...(mediaFiles || []), ...newFiles];

    if (combined.length > MAX_FILES) {
      alert(`Max ${MAX_FILES} files allowed`);
      combined = combined.slice(0, MAX_FILES);
    }

    setMediaFiles(combined);

    if (newFiles.length > 0 && setSelectedFile) {
      setSelectedFile(newFiles[0]);
    }
  };

  // =========================
  // Remove File
  // =========================
  const removeFile = (index) => {
    setMediaFiles((prev = []) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // =========================
  // Prevent Browser Drop Navigation
  // =========================
  useEffect(() => {
    const preventDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener("dragover", preventDrop);
    window.addEventListener("drop", preventDrop);

    return () => {
      window.removeEventListener("dragover", preventDrop);
      window.removeEventListener("drop", preventDrop);
    };
  }, []);

  console.log("MEDIA FILES:", mediaFiles);

  return (
    <div className="space-y-4">

      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);

          // reset input so same file can be selected again
          e.target.value = "";
        }}
      />

      {/* Upload Tile */}
      <div className="flex justify-center">
  <button
    type="button"
    onClick={() => fileInputRef.current?.click()}
    className="
      flex
      flex-col
      items-center
      gap-1
      p-3
      rounded-xl
      hover:bg-gray-100
      transition
    "
  >
    <FiUpload className="text-2xl text-blue-500" />

    <span className="text-xs text-gray-600">
      Photos/Videos
    </span>
  </button>
</div>

      {/* Preview Section */}
{mediaFiles?.length > 0 && (
  mediaFiles.length === 1 ? (
    <div className="mt-4">
      {(() => {
        const file = mediaFiles[0];
        const preview = previewUrls[0];

        const isImage =
          file?.type?.startsWith?.("image");

        const isVideo =
          file?.type?.startsWith?.("video");

        return (
          <div className="relative rounded-xl overflow-hidden shadow-md bg-black">
            <button
              type="button"
              onClick={() => removeFile(0)}
              className="
                absolute
                top-2
                right-2
                z-10
                bg-black/70
                text-white
                w-8
                h-8
                rounded-full
              "
            >
              ✕
            </button>

            {isImage && preview && (
              <img
                src={preview}
                alt=""
                className="w-full max-h-[500px] object-cover"
              />
            )}

            {isVideo && preview && (
              <video
                src={preview}
                controls
                muted
                className="w-full max-h-[500px] object-cover"
              />
            )}
          </div>
        );
      })()}
    </div>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
      {mediaFiles.map((file, i) => {
        const preview = previewUrls[i];

        const isImage =
          file?.type?.startsWith?.("image");

        const isVideo =
          file?.type?.startsWith?.("video");

        return (
          <div
            key={`${i}-${preview}`}
            className="
              relative
              group
              rounded-xl
              overflow-hidden
              shadow-md
              bg-black
            "
          >
            <button
              type="button"
              onClick={() => removeFile(i)}
              className="
                absolute
                top-2
                right-2
                z-10
                bg-black/70
                text-white
                w-7
                h-7
                rounded-full
                text-sm
              "
            >
              ✕
            </button>

            {isImage && preview && (
              <img
                src={preview}
                alt=""
                className="w-full h-[70vh] object-cover"
  />
              
            )}

            {isVideo && preview && (
              <video
                src={preview}
                controls
                muted
                className="w-full h-[70vh] object-cover"
              />
            )}
          </div>
        );
      })}
    </div>
  )
)}
</div>
  );
};


export default MediaUpload;