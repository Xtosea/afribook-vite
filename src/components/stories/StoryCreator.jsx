import React, { useRef, useState } from "react";

const StoryCreator = ({ onClose, onSelectFile }) => {
  const fileRef = useRef();

  // ================= STATES =================
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState("");
  const [music, setMusic] = useState(null);

  // ================= HANDLE FILE =================
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMedia(file);
    setPreview(URL.createObjectURL(file));
  };

  // ================= POST STORY =================
  const handlePost = async () => {
    if (!media) return;

    const formData = new FormData();
    formData.append("media", media);
    formData.append("text", text);

    if (music) {
      formData.append("music", music);
    }

    await onSelectFile(formData);
    onClose();
  };

  // ================= UI =================
  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">

      <div className="bg-white w-full max-w-md rounded-2xl p-4">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">Create Story</h2>

          <button
            onClick={onClose}
            className="text-red-500 font-bold"
          >
            ✕
          </button>
        </div>

        {/* MEDIA PREVIEW */}
        {preview && (
          <div className="relative mb-3 rounded-xl overflow-hidden max-h-[300px] flex items-center justify-center bg-black">

            {media?.type?.startsWith("video") ? (
              <video
  src={preview}
  controls
  className="max-h-[300px] w-auto object-contain"
/>
            ) : (
              <img
  src={preview}
  className="max-h-[300px] w-auto object-contain"
/>
            )}

            {/* TEXT OVERLAY */}
            {text && (
              <div className="absolute bottom-4 left-4 right-4 text-white text-lg font-bold">
                {text}
              </div>
            )}
          </div>
        )}

        {/* TEXT INPUT */}
        <input
          type="text"
          placeholder="Add text to story..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />

        {/* MUSIC INPUT */}
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setMusic(e.target.files[0])}
          className="w-full mb-3"
        />

        {music && (
          <audio
            controls
            src={URL.createObjectURL(music)}
            className="w-full mb-3"
          />
        )}

        {/* MEDIA PICKER BUTTON */}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full bg-blue-600 text-white p-3 rounded-xl mb-3"
        >
          📷 Add Photo / Video
        </button>

        {/* POST BUTTON */}
        <button
          onClick={handlePost}
          className="w-full bg-black text-white p-3 rounded-xl"
        >
          Post Story
        </button>

        {/* HIDDEN FILE INPUT */}
        <input
          type="file"
          ref={fileRef}
          className="hidden"
          accept="image/*,video/*"
          onChange={handleFile}
        />
      </div>
    </div>
  );
};

export default StoryCreator;