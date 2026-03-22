import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "../api/api";
import { useNavigate } from "react-router-dom";

const Reels = () => {
  const [videos, setVideos] = useState([]);
  const videoRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const res = await fetch(`${API_BASE}/api/posts`);
    const data = await res.json();

    // extract videos + keep postId
    const vids = data.flatMap(post =>
      post.media
        ?.filter(m => m.type === "video")
        .map(m => ({
          ...m,
          postId: post._id
        })) || []
    );

    setVideos(vids);
  };

  /* ================= INTERSECTION OBSERVER ================= */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const video = entry.target;

          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.7, // 70% visible
      }
    );

    videoRefs.current.forEach(video => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach(video => {
        if (video) observer.unobserve(video);
      });
    };
  }, [videos]);

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">

      {videos.map((video, i) => (
        <div
          key={i}
          className="h-screen w-full snap-start relative"
        >
          <video
            ref={(el) => (videoRefs.current[i] = el)}
            src={video.url}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
            preload="none" // 🔥 lazy load
            onClick={() => navigate(`/post/${video.postId}`)} // 👉 single tap
          />

          {/* overlay info */}
          <div className="absolute bottom-6 left-4 text-white">
            <p className="text-sm opacity-80">Tap to view post</p>
          </div>
        </div>
      ))}

    </div>
  );
};

export default Reels;