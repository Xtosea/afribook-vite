import React from "react";
import { API_BASE } from "../../api/api";

const StoriesBar = ({ user, posts = [], onStoryClick }) => {
  const safeUser = user && typeof user === "object" && !user.$$typeof ? user : {};

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {/* YOUR STORY */}
      <div
        className="min-w-[80px] h-32 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-sm cursor-pointer"
        onClick={() => alert("Upload your story!")}
      >
        <img
          src={safeUser.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`}
          className="w-10 h-10 rounded-full mb-1"
        />
        Add Story
      </div>

      {/* OTHERS' STORIES */}
      {posts.slice(0, 10).map((post, index) => {
        const postUser = post.user && typeof post.user === "object" && !post.user.$$typeof ? post.user : {};
        return (
          <div
            key={post._id || index}
            className="min-w-[80px] h-32 bg-gray-300 rounded-lg flex flex-col items-center justify-center text-xs cursor-pointer"
            onClick={() => onStoryClick(post)}
          >
            <img
              src={postUser.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`}
              className="w-10 h-10 rounded-full mb-1"
            />
            {postUser.name || "Unknown"}
          </div>
        );
      })}
    </div>
  );
};

export default StoriesBar;