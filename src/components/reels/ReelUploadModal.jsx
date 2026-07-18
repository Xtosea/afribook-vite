import React from "react";
import MusicLibrary from "./MusicLibrary";

const ReelUploadModal = ({
  preview,
  caption,
  setCaption,

  songs,
  selectedSong,
  setSelectedSong,

  stickers,
  selectedSticker,
  setSelectedSticker,

  fileRef,
  handleFileChange,
  uploadReel,
  setShowUpload,
  progress,
  loading,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">

      <div className="bg-zinc-900 p-4 rounded-2xl w-[95%] max-w-md max-h-[95vh] overflow-y-auto text-white shadow-2xl border border-zinc-700">

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

        {/* MUSIC */}
        <div className="mb-5">
          <h3 className="font-semibold mb-2">
            🎵 Choose Music
          </h3>

          <MusicLibrary
            songs={songs}
            onSelect={setSelectedSong}
          />

          {selectedSong && (
            <p className="text-green-400 text-sm mt-2">
              Selected: {selectedSong.title}
            </p>
          )}
        </div>

        {/* STICKERS */}
        <div className="mb-5">
          <h3 className="font-semibold mb-2">
            😀 Choose Sticker
          </h3>

          <div className="grid grid-cols-4 gap-3">
            {stickers.map((sticker) => (
              <button
                key={sticker._id}
                onClick={() => setSelectedSticker(sticker)}
                className={`rounded-xl p-1 ${
                  selectedSticker?._id === sticker._id
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
              >
                <img
                  src={sticker.url}
                  alt=""
                  className="w-16 h-16 object-contain"
                />
              </button>
            ))}
          </div>
        </div>

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
            className="flex-1 bg-zinc-700 py-3 rounded-xl hover:bg-zinc-600"
          >
            Select Video
          </button>

          <button
            onClick={() => setShowUpload(false)}
            className="flex-1 bg-red-500 py-3 rounded-xl hover:bg-red-600"
          >
            Cancel
          </button>

          <button
            onClick={uploadReel}
            disabled={loading}
            className="flex-1 bg-blue-500 py-3 rounded-xl disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Post"}
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