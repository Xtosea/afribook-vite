// src/components/profile/VideosSection.jsx
import React from "react";
import PostCard from "../PostCard";

const VideosSection = ({ videos = [] }) => {
  if (!videos.length) return <p className="text-center py-4">No videos yet.</p>;

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <PostCard key={video._id} post={video} />
      ))}
    </div>
  );
};

export default VideosSection;