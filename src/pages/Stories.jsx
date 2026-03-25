// src/components/Stories.jsx
import React, { useEffect, useState } from "react";
import { API_BASE } from "../api/api";
import { socket } from "../socket"; // your socket instance

const Stories = () => {
  const [stories, setStories] = useState([]);

  // Fetch initial stories
  const fetchStories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stories`);
      const data = await res.json();
      setStories(data);
    } catch (err) {
      console.error("Failed to fetch stories:", err);
    }
  };

  useEffect(() => {
    fetchStories();

    // Listen for new stories in real-time
    socket.on("new-story", (story) => {
      setStories((prev) => [story, ...prev]);
    });

    return () => {
      socket.off("new-story");
    };
  }, []);

  return (
    <div className="flex overflow-x-auto gap-3 p-3">
      {stories.map((story) => (
        <div key={story._id} className="text-center">
          <img
            src={story.user.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`}
            className="w-16 h-16 rounded-full border-2 border-pink-500"
            alt={story.user.name}
          />
          <p className="text-xs">{story.user.name}</p>
        </div>
      ))}
    </div>
  );
};

export default Stories;