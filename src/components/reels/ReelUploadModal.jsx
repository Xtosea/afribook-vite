import React from "react";

const ReelUploadModal = ({
  preview,
  caption,
  setCaption,
  fileRef,
  handleFileChange,
  uploadReel,
  setShowUpload,
  progress,
  loading,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">

      <div className="bg-zinc-900 p-4 rounded-2xl w-[95%] max-w-md text-white shadow-2xl border border-zinc-700">

        <h2 className="text-xl font-bold mb-4">
          Create Reel
        </h2>

        {preview && (
          <video
            src={preview}
            className="w-full h-64 rounded-xl object-cover mb-4"
            controls
          />
        )}

        <textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full bg-black border border-zinc-700 p-3 rounded-xl mb-4 resize-none outline-none"
          rows={4}
        />

        {loading && (
          <div className="mb-4">

            <div className="w-full bg-zinc-700 h-3 rounded-full overflow-hidden">

              <div
                className="bg-blue-500 h-3 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />

            </div>

            <p className="text-center text-sm mt-2">
              Uploading... {progress}%
            </p>

          </div>
        )}

        <div className="flex justify-between gap-3">

          <button
            onClick={() => fileRef.current.click()}
            className="flex-1 bg-zinc-700 py-3 rounded-xl hover:bg-zinc-600 transition"
          >
            Select Video
          </button>

          <button
            onClick={() => setShowUpload(false)}
            className="flex-1 bg-red-500 py-3 rounded-xl hover:bg-red-600 transition"
          >
            Cancel
          </button>

          <button
            onClick={uploadReel}
            className="flex-1 bg-blue-500 py-3 rounded-xl hover:bg-blue-600 transition"
          >
            Post
          </button>

        </div>

        <input
          type="file"
          accept="video/*"
          ref={fileRef}
          className="hidden"
          onChange={handleFileChange}
        />

      </div>

    </div>
  );
};

export default ReelUploadModal;