import React, { useRef, useState } from "react";
import { API_BASE } from "../../api/api";

const ReelUpload = () => {
  const fileRef = useRef();
  const [caption, setCaption] = useState("");

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("video", file);
    form.append("caption", caption);

    const token = localStorage.getItem("token");

    await fetch(`${API_BASE}/api/reels/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    setCaption("");
  };

  return (
    <div className="fixed bottom-24 right-4">

      {/* Caption Input */}
      <input
        placeholder="Write caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="mb-2 p-2 rounded-lg shadow"
      />

      <div
        onClick={() => fileRef.current.click()}
        className="bg-white text-black w-14 h-14 rounded-full flex items-center justify-center shadow-xl cursor-pointer"
      >
        🎬
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={upload}
      />

    </div>
  );
};

export default ReelUpload;