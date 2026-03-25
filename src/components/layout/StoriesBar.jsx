import React from "react";
import { API_BASE } from "../../api/api";

const StoriesBar = ({ user, posts = [], onStoryClick }) => {
  const safeUser = user && typeof user === "object" && !user.$$typeof ? user : {};

  // Group stories by user
  const storiesByUser = posts.reduce((acc, story) => {
    const userId = story.user?._id || "unknown";
    if (!acc[userId]) acc[userId] = [];
    acc[userId].push(story);
    return acc;
  }, {});

  const users = [{ _id: safeUser._id, name: safeUser.name, profilePic: safeUser.profilePic }, ...Object.values(storiesByUser).map(s => s[0].user)];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {/* YOUR STORY */}
      <div
        className="min-w-[80px] h-32 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-sm cursor-pointer relative"
        onClick={() => {
          if (storiesByUser[safeUser._id]?.length) {
            onStoryClick && onStoryClick(storiesByUser[safeUser._id][0]);
          }
        }}
      >
        <img
          src={safeUser.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`}
          className="w-10 h-10 rounded-full mb-1 border-2 border-blue-500"
        />
        <span className="text-xs text-center">Your Story</span>
        {storiesByUser[safeUser._id]?.length > 0 && (
          <span className="absolute top-1 right-1 text-white text-xs bg-blue-500 px-1 rounded">NEW</span>
        )}
      </div>

      {/* OTHER USERS */}
      {Object.values(storiesByUser).map((userStories) => {
        const u = userStories[0].user;
        const hasNew = userStories.some((s) => !s.viewed); // optional viewed flag
        return (
          <div
            key={u._id}
            className="min-w-[80px] h-32 rounded-lg flex flex-col items-center justify-center text-xs cursor-pointer relative"
            onClick={() => onStoryClick && onStoryClick(userStories[0])}
          >
            <div
              className={`w-10 h-10 rounded-full mb-1 p-[2px] ${
                hasNew ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" : "bg-gray-300"
              }`}
            >
              <img
                src={u.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`}
                className="w-full h-full rounded-full border-2 border-white"
              />
            </div>
            <span className="text-center">{u.name || "Unknown"}</span>
          </div>
        );
      })}
    </div>
  );
};

export default StoriesBar;