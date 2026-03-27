import React, { useRef } from "react";
import { API_BASE } from "../../api/api";

const ReelUpload = () => {
  const fileRef = useRef();

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("video", file);

    const token = localStorage.getItem("token");

    await fetch(`${API_BASE}/api/reels/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });
  };

  return (
    <div
      onClick={() => fileRef.current.click()}
      className="fixed bottom-24 right-4 bg-white p-3 rounded-full shadow-lg cursor-pointer"
    >
      🎬

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