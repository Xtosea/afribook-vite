import React, { useEffect, useState, useRef } from "react";
import { API_BASE } from "../api/api";

const Reels = () => {
  const [videos, setVideos] = useState([]);
  const containerRef = useRef();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const res = await fetch(`${API_BASE}/api/posts`);
    const data = await res.json();

    // only videos
    const vids = data.flatMap(post =>
      post.media?.filter(m => m.type === "video") || []
    );

    setVideos(vids);
  };

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black"
    >
      {videos.map((video, i) => (
        <div
          key={i}
          className="h-screen w-full snap-start flex items-center justify-center"
        >
          <video
            src={video.url}
            className="h-full w-full object-cover"
            controls
            autoPlay
            loop
          />
        </div>
      ))}
    </div>
  );
};

export default Reels;