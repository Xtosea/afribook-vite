// src/pages/Reels.jsx
import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "../api/api";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io(API_BASE);

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [likes, setLikes] = useState({});
  const videoRefs = useRef([]);
  const fileRef = useRef();
  const captionRef = useRef();
  const navigate = useNavigate();

  /* Fetch reels from backend */
  const fetchReels = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reels`);
      const data = await res.json();
      setReels(data);

      // Initialize likes
      const initialLikes = {};
      data.forEach(r => {
        initialLikes[r._id] = r.likes?.length || 0;
      });
      setLikes(initialLikes);
    } catch (err) {
      console.error("Fetch reels error:", err);
    }
  };

  useEffect(() => {
    fetchReels();

    // Listen for new reels via socket
    socket.on("new-reel", reel => {
      setReels(prev => [reel, ...prev]);
      setLikes(prev => ({ ...prev, [reel._id]: reel.likes?.length || 0 }));
    });

    return () => {
      socket.off("new-reel");
    };
  }, []);

  /* Like a reel */
  const likeReel = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/posts/like/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setLikes(prev => ({ ...prev, [id]: data.likesCount || prev[id] }));
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  /* Record view */
  const recordView = async (id) => {
    try {
      await fetch(`${API_BASE}/api/reels/view/${id}`, { method: "POST" });
    } catch (err) {
      console.error("Record view error:", err);
    }
  };

  /* Auto-play reels when visible */
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play();
            recordView(video.dataset.id);
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach(video => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach(video => {
        if (video) observer.unobserve(video);
      });
    };
  }, [reels]);

  /* Upload reel */
  const handleUpload = async () => {
    const file = fileRef.current.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("video", file);
    formData.append("caption", captionRef.current.value || "");

    try {
      const res = await fetch(`${API_BASE}/api/reels/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      setReels(prev => [data, ...prev]);
      fileRef.current.value = "";
      captionRef.current.value = "";
    } catch (err) {
      console.error("Upload reel error:", err);
    }
  };

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black relative">

      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 bg-black text-white p-3 z-50 flex justify-between items-center">
        <h1 className="font-bold text-lg">Reels</h1>
        <button onClick={() => fileRef.current.click()} className="px-3 py-1 border border-white rounded">
          Upload
        </button>
      </div>

      {/* Hidden file input & caption */}
      <input type="file" ref={fileRef} className="hidden" accept="video/*" onChange={handleUpload} />
      <input type="text" ref={captionRef} className="hidden" placeholder="Add caption..." />

      {reels.map((reel, i) => (
        <div key={reel._id} className="h-screen snap-start relative">

          {/* Video */}
          <video
            data-id={reel._id}
            ref={el => (videoRefs.current[i] = el)}
            src={reel.media[0].url}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
            onPlay={() => recordView(reel._id)}
          />

          {/* Double tap to like */}
          <div
            className="absolute inset-0"
            onDoubleClick={() => likeReel(reel._id)}
          />

          {/* User info */}
          <div className="absolute bottom-20 left-4 text-white">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate(`/profile/${reel.user._id}`)}
            >
              <img src={reel.user.profilePic} className="w-10 h-10 rounded-full" />
              <span>{reel.user.name}</span>
            </div>
            {reel.content && <p className="mt-2 text-sm">{reel.content}</p>}
          </div>

          {/* Actions */}
          <div className="absolute right-4 bottom-20 text-white flex flex-col gap-4">
            <button onClick={() => likeReel(reel._id)} className="text-2xl">
              ❤️ <div className="text-sm">{likes[reel._id] || 0}</div>
            </button>
            <button className="text-2xl">💬</button>
            <button className="text-2xl">🔗</button>
          </div>

        </div>
      ))}

    </div>
  );
};

export default Reels;