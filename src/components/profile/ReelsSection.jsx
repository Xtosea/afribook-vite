// src/components/profile/ReelsSection.jsx
import React from "react";
import PostCard from "../PostCard";

const ReelsSection = ({ reels = [] }) => {
  if (!reels.length) return <p className="text-center py-4">No reels yet.</p>;

  return (
    <div className="space-y-4">
      {reels.map((reel) => (
        <PostCard key={reel._id} post={reel} />
      ))}
    </div>
  );
};

export default ReelsSection;