import React, { useRef } from "react";

const StoryCreator = ({
  onClose,
  onSelectFile,
}) => {
  const fileRef = useRef();

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">

      <div className="bg-white w-full max-w-md rounded-2xl p-4">

        <div className="flex justify-between items-center mb-4">

          <h2 className="font-bold text-xl">
            Create Story
          </h2>

          <button
            onClick={onClose}
            className="text-red-500"
          >
            ✕
          </button>

        </div>

        <button
          onClick={() =>
            fileRef.current?.click()
          }
          className="w-full bg-blue-600 text-white p-3 rounded-xl mb-3"
        >
          📷 Add Photo / Video
        </button>

        <button
          className="w-full bg-green-600 text-white p-3 rounded-xl mb-3"
        >
          🎵 Add Music
        </button>

        <button
          className="w-full bg-purple-600 text-white p-3 rounded-xl"
        >
          ✍ Add Text
        </button>

        <input
          type="file"
          ref={fileRef}
          className="hidden"
          accept="image/*,video/*"
          onChange={onSelectFile}
        />

      </div>

    </div>
  );
};

export default StoryCreator;