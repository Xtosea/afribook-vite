// src/pages/Reels.jsx
import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "../api/api";
import { useNavigate } from "react-router-dom";
import { connectSocket } from "../socket";

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [likes, setLikes] = useState({});
  const [shares, setShares] = useState({});
  const videoRefs = useRef([]);
  const fileRef = useRef();
  const [caption, setCaption] = useState("");
  const navigate = useNavigate();

  /* Fetch reels */
  const fetchReels = async () => {
    try {
      const res = await fetch(`${API_BASE}/reels`);
      const data = await res.json();
      setReels(data);

      const initialLikes = {};
      const initialShares = {};
      data.forEach((r) => {
        initialLikes[r._id] = r.likes?.length || 0;
        initialShares[r._id] = r.shares || 0;
      });
      setLikes(initialLikes);
      setShares(initialShares);
    } catch (err) {
      console.error("Fetch reels error:", err);
    }
  };

  useEffect(() => {
    fetchReels();

    /* Socket listeners */
    socket.on("new-reel", (reel) => {
      setReels((prev) => [reel, ...prev]);
      setLikes((prev) => ({ ...prev, [reel._id]: reel.likes?.length || 0 }));
      setShares((prev) => ({ ...prev, [reel._id]: reel.shares || 0 }));
    });

    socket.on("reel-like", ({ reelId, likesCount }) => {
      setLikes((prev) => ({ ...prev, [reelId]: likesCount }));
    });

    socket.on("reel-share", ({ reelId, shares }) => {
      setShares((prev) => ({ ...prev, [reelId]: shares }));
    });

    socket.on("reel-comment", ({ reelId, comment }) => {
      setReels((prev) =>
        prev.map((r) =>
          r._id === reelId ? { ...r, comments: [...(r.comments || []), comment] } : r
        )
      );
    });

    return () => socket.off("new-reel");
  }, []);

  /* Auto-play */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          entry.isIntersecting ? video.play() : video.pause();
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((video) => video && observer.observe(video));
    return () =>
      videoRefs.current.forEach((video) => video && observer.unobserve(video));
  }, [reels]);

  /* Record view */
  const recordView = async (id) => {
    try {
      await fetch(`${API_BASE}/reels/view/${id}`, { method: "POST" });
    } catch (err) {
      console.error(err);
    }
  };

  /* Like */
  const likeReel = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/reels/${id}/like`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      setLikes((prev) => ({ ...prev, [id]: data.likesCount }));
    } catch (err) {
      console.error(err);
    }
  };

  /* Share */
  const shareReel = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/reels/${id}/share`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      setShares((prev) => ({ ...prev, [id]: data.shares }));
      alert("Reel shared!");
    } catch (err) {
      console.error(err);
    }
  };

  /* Upload */
  const uploadReel = async (e) => {
    e.preventDefault();
    const file = fileRef.current.files[0];
    if (!file) return alert("Select a video");

    const formData = new FormData();
    formData.append("video", file);
    formData.append("caption", caption);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/reels/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      await res.json();
      setCaption("");
      fileRef.current.value = null;
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black relative">

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 bg-black text-white p-3 z-50 flex justify-between items-center">
        <h1 className="font-bold text-lg">Reels</h1>
        <button onClick={() => fileRef.current.click()} className="bg-white text-black px-3 py-1 rounded">
          Upload
        </button>
        <input
          type="file"
          accept="video/*"
          ref={fileRef}
          className="hidden"
          onChange={uploadReel}
        />
      </div>

      {/* Reels list */}
      {reels.map((reel, i) => (
        <div key={reel._id} className="h-screen snap-start relative">

          <video
            ref={(el) => (videoRefs.current[i] = el)}
            src={reel.media[0]?.url}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
            onPlay={() => recordView(reel._id)}
          />

          {/* Overlay actions */}
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            {/* User info */}
            <div className="flex items-center gap-2 text-white cursor-pointer"
                 onClick={() => navigate(`/profile/${reel.user._id}`)}>
              <img src={reel.user.profilePic} className="w-10 h-10 rounded-full" />
              <span>{reel.user.name}</span>
            </div>

            {/* Bottom actions */}
            <div className="flex flex-col items-end gap-4 text-white">
              <button onClick={() => likeReel(reel._id)} className="text-2xl">❤️ {likes[reel._id] || 0}</button>
              <button onClick={() => shareReel(reel._id)} className="text-2xl">🔗 {shares[reel._id] || 0}</button>
              <div className="bg-black/50 rounded p-2 max-w-xs text-sm">{reel.content}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Reels;