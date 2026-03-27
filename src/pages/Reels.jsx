import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "../api/api";
import { useNavigate } from "react-router-dom";

const Reels = () => {
  const [videos, setVideos] = useState([]);
  const videoRefs = useRef([]);
  const fileRef = useRef();
  const navigate = useNavigate();
  const [likes, setLikes] = useState({});
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");

  // Fetch reels from backend
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reels`);
      const data = await res.json();

      const vids = data.map((post) => ({
        ...post,
        likes: post.likes?.length || 0,
      }));

      setVideos(vids);

      // Initialize likes state
      const initialLikes = {};
      vids.forEach((v) => {
        initialLikes[v._id] = v.likes;
      });
      setLikes(initialLikes);
    } catch (err) {
      console.error("Fetch reels error:", err);
    }
  };

  /* Like video */
  const likeVideo = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/posts/like/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLikes((prev) => ({ ...prev, [id]: data.likes }));
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  /* Record view */
  const recordView = async (id) => {
    try {
      await fetch(`${API_BASE}/api/reels/view/${id}`, {
        method: "POST",
      });
    } catch (err) {
      console.error("View error:", err);
    }
  };

  /* Auto-play reels */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          entry.isIntersecting
            ? video.play() && recordView(video.dataset.id)
            : video.pause();
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((v) => v && observer.observe(v));
    return () => videoRefs.current.forEach((v) => v && observer.unobserve(v));
  }, [videos]);

  /* Upload reel */
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("caption", caption);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/reels/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setVideos((prev) => [data, ...prev]);
        setCaption("");
      } else {
        console.error("Upload failed:", data);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
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
          ref={fileRef}
          accept="video/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {videos.map((video, i) => (
        <div key={i} className="h-screen snap-start relative">

          {/* Video */}
          <video
            ref={(el) => (videoRefs.current[i] = el)}
            src={video.media[0]?.url}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
            data-id={video._id}
          />

          {/* Double-tap like overlay */}
          <div
            className="absolute inset-0"
            onDoubleClick={() => likeVideo(video._id)}
          />

          {/* User & Caption */}
          <div className="absolute bottom-20 left-4 text-white max-w-xs">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate(`/profile/${video.user._id}`)}
            >
              <img src={video.user.profilePic} className="w-10 h-10 rounded-full" />
              <span className="font-semibold">{video.user.name}</span>
            </div>
            <div className="text-sm mt-1">{video.content}</div>
          </div>

          {/* Actions */}
          <div className="absolute right-4 bottom-20 text-white flex flex-col gap-4 text-2xl">
            <button onClick={() => likeVideo(video._id)}>
              ❤️ {likes[video._id] || 0}
            </button>
            <button>💬</button>
            <button>🔗</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Reels;