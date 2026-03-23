import React from "react";
import { API_BASE } from "../../api/api";

const StoriesBar = ({ user, posts }) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">

      {/* YOUR STORY */}
      <div className="min-w-[80px] h-32 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-sm cursor-pointer">
        <img
          src={user?.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`}
          className="w-10 h-10 rounded-full mb-1"
        />
        Add Story
      </div>

      {/* OTHERS */}
      {posts.slice(0, 10).map(post => (
        <div
          key={post._id}
          className="min-w-[80px] h-32 bg-gray-300 rounded-lg flex items-center justify-center text-xs"
        >
          {post.user?.name}
        </div>
      ))}

    </div>
  );
};

export default StoriesBar;