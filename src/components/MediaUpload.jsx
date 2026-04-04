import React from "react";

const MediaUpload = ({ mediaFiles, setMediaFiles }) => {
  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles([...mediaFiles, ...files]);
  };

  const removeFile = (index) => {
    const updated = [...mediaFiles];
    updated.splice(index, 1);
    setMediaFiles(updated);
  };

  return (
    <div className="my-2">
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFiles}
        className="border p-2 rounded w-full cursor-pointer"
      />

      {mediaFiles.length > 0 && (
        <div className="flex flex-wrap mt-2 gap-2">
          {mediaFiles.map((file, idx) => (
            <div
              key={idx}
              className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden flex items-center justify-center"
            >
              {file.type.startsWith("image") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <video
                  src={URL.createObjectURL(file)}
                  className="object-cover w-full h-full"
                  muted
                  controls
                />
              )}
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-1 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;