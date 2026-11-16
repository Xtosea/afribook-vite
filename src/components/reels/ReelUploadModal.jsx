import React, { useState } from "react";
import MusicLibrary from "./MusicLibrary";
import StickerLibrary from "./StickerLibrary";
import ReelStickerEditor from "./ReelStickerEditor";

const ReelUploadModal = ({
  preview,
  caption,
  setCaption,
  visibility,
  setVisibility,
  songs,
  selectedSong,
  setSelectedSong,
  stickers,
  selectedStickers = [],
  addSticker,
  updateSticker,
  removeSticker,
  fileRef,
  handleFileChange,
  uploadReel,
  setShowUpload,
  progress,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState("music");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 backdrop-blur-sm">
      <div className="flex h-[92dvh] max-h-[760px] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 text-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="text-xl font-bold">Create Reel</h2>
          <button
            type="button"
            onClick={() => setShowUpload(false)}
            disabled={loading}
            aria-label="Close Reel editor"
            className="rounded-lg px-3 py-2 text-xl text-white/70 hover:bg-white/10 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
          {(preview || selectedStickers.length > 0) && (
            <div>
              <p className="mb-2 text-center text-xs text-white/60">
                Drag stickers to move them. Use the controls to edit them.
              </p>

              <ReelStickerEditor
                stickers={selectedStickers}
                onUpdate={updateSticker}
                onRemove={removeSticker}
              >
                {preview && (
                  <video
                    src={preview}
                    className="h-full w-full rounded-xl bg-black object-contain"
                    controls
                    playsInline
                  />
                )}
              </ReelStickerEditor>
            </div>
          )}

          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            className="w-full resize-none rounded-xl border border-zinc-700 bg-black p-3 text-white outline-none focus:border-blue-500"
            rows={3}
          />

          <div className="rounded-xl border border-zinc-700 bg-black/40 p-3">
            <label htmlFor="reel-visibility" className="block text-sm font-semibold">
              Who can see this reel?
            </label>
            <select
              id="reel-visibility"
              value={visibility}
              onChange={(event) => setVisibility(event.target.value)}
              disabled={loading}
              className="mt-2 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white"
            >
              <option value="public">Public — Everyone</option>
              <option value="friends">Friends — Accepted friends</option>
              <option value="private">Private — Only me</option>
            </select>
          </div>

          {selectedSong && (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-blue-500/10 p-3">
              <span className="min-w-0 truncate text-sm text-blue-300">
                🎵 {selectedSong.title}
              </span>
              <button
                type="button"
                onClick={() => setSelectedSong(null)}
                className="shrink-0 text-sm text-red-400"
              >
                Remove
              </button>
            </div>
          )}

          {selectedStickers.length > 0 && (
            <p className="rounded-lg bg-white/10 p-3 text-sm text-white/70">
              😀 {selectedStickers.length} sticker(s) added to this Reel.
            </p>
          )}

          <div>
            <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-black/40 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("music")}
                aria-pressed={activeTab === "music"}
                className={`rounded-lg py-3 text-sm font-semibold ${
                  activeTab === "music"
                    ? "bg-blue-600 text-white"
                    : "text-white/60 hover:bg-white/10"
                }`}
              >
                🎵 Music
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("stickers")}
                aria-pressed={activeTab === "stickers"}
                className={`rounded-lg py-3 text-sm font-semibold ${
                  activeTab === "stickers"
                    ? "bg-blue-600 text-white"
                    : "text-white/60 hover:bg-white/10"
                }`}
              >
                😀 Stickers
              </button>
            </div>

            {activeTab === "music" ? (
              <div className="max-h-[42dvh] overflow-y-auto overscroll-contain">
                <MusicLibrary
                  songs={songs}
                  selectedSong={selectedSong}
                  onSelect={setSelectedSong}
                />
              </div>
            ) : (
              <div className="flex h-[42dvh] min-h-[240px] max-h-[380px] flex-col overflow-hidden">
                <StickerLibrary onSelect={addSticker} />
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="shrink-0 border-t border-white/10 px-4 py-3">
            <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-700">
              <div
                className="h-3 bg-blue-500 transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(0, Number(progress) || 0))}%`,
                }}
              />
            </div>
            <p className="mt-2 text-center text-sm">
              Uploading... {progress}%
            </p>
          </div>
        )}

        <div className="grid shrink-0 grid-cols-3 gap-2 border-t border-white/10 bg-zinc-900 p-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="rounded-xl bg-zinc-700 py-3 text-sm font-medium hover:bg-zinc-600 disabled:opacity-50"
          >
            Select Video
          </button>

          <button
            type="button"
            onClick={() => setShowUpload(false)}
            disabled={loading}
            className="rounded-xl bg-red-600 py-3 text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={uploadReel}
            disabled={loading}
            className="rounded-xl bg-blue-600 py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
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