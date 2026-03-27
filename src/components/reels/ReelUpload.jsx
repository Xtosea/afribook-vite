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
    <>
      <div
        onClick={() => fileRef.current.click()}
        className="fixed bottom-24 right-4 bg-white text-black w-14 h-14 rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:scale-105 transition"
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
    </>
  );
};

export default ReelUpload;