import React from "react";
import { API_BASE } from "../../api/api";

const StoriesBar = ({ user, posts = [] }) => {
  const safeUser = user && typeof user === "object" && !user.$$typeof ? user : {};

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">

      {/* YOUR STORY */}
      <div className="min-w-[80px] h-32 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-sm cursor-pointer">
        <img
          src={safeUser.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`}
          className="w-10 h-10 rounded-full mb-1"
        />
        Add Story
      </div>

      {/* OTHERS */}
      {posts.slice(0, 10).map(post => {
        const postUser = post.user && typeof post.user === "object" && !post.user.$$typeof ? post.user : {};
        return (
          <div
            key={post._id || Math.random()}
            className="min-w-[80px] h-32 bg-gray-300 rounded-lg flex items-center justify-center text-xs"
          >
            {postUser.name || "Unknown"}
          </div>
        );
      })}
    </div>
  );
};

export default StoriesBar;