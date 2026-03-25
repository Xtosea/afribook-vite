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
    try {
      const res = await fetch(`${API_BASE}/api/posts`);
      const data = await res.json();

      const vids = data.flatMap((post) =>
        post.media
          ?.filter((m) => m.type === "video")
          .map((m) => ({
            ...m,
            postId: post._id,
            user: post.user
          })) || []
      );

      setVideos(vids);
    } catch (err) {
      console.error(err);
    }
  };

  /* Auto play */
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

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, [videos]);

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">

      {videos.map((video, i) => (
        <div key={i} className="h-screen snap-start relative">

          <video
            ref={(el) => (videoRefs.current[i] = el)}
            src={video.url}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
          />

          {/* User */}
          <div className="absolute bottom-20 left-4 text-white">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate(`/profile/${video.user._id}`)}
            >
              <img
                src={video.user.profilePic}
                className="w-10 h-10 rounded-full"
              />

              <span>{video.user.name}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="absolute right-4 bottom-20 text-white flex flex-col gap-4">

            <button>❤️</button>
            <button>💬</button>
            <button>🔗</button>

          </div>

        </div>
      ))}

    </div>
  );
};

export default Reels;