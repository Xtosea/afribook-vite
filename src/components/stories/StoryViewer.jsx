import React, { useEffect, useState } from "react";
import { API_BASE } from "../../api/api";

const StoryViewer = ({ stories = [], index = 0, onClose }) => {
  const [current, setCurrent] = useState(index);
  const [progress, setProgress] = useState(0);

  const story = stories[current];

  /* ================= AUTO NEXT ================= */
  useEffect(() => {
    setProgress(0);

    const duration = story?.type === "video" ? 10000 : 5000;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + 2;
      });
    }, duration / 50);

    return () => clearInterval(interval);
  }, [current]);

  /* ================= NEXT ================= */
  const nextStory = () => {
    if (current < stories.length - 1) {
      setCurrent(current + 1);
    } else {
      onClose();
    }
  };

  /* ================= PREV ================= */
  const prevStory = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  /* ================= VIEW TRACK ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_BASE}/api/stories/view/${story?._id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }, [current]);

  /* ================= REACT ================= */
  const reactStory = async () => {
    const token = localStorage.getItem("token");

    await fetch(`${API_BASE}/api/stories/react/${story?._id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  if (!story) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">

      {/* PROGRESS BAR */}
      <div className="flex gap-1 p-2">
        {stories.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 bg-gray-600 rounded"
          >
            <div
              className="h-1 bg-white rounded"
              style={{
                width:
                  i === current
                    ? `${progress}%`
                    : i < current
                    ? "100%"
                    : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center p-3 text-white">
        <div className="flex items-center gap-2">
          <img
            src={story.user?.profilePic}
            className="w-8 h-8 rounded-full"
          />
          <span>{story.user?.name}</span>
        </div>

        <button onClick={onClose}>✕</button>
      </div>

      {/* MEDIA */}
      <div className="flex-1 flex items-center justify-center">
        {story.type === "video" ? (
          <video
            src={story.media}
            autoPlay
            className="max-h-full"
          />
        ) : (
          <img
            src={story.media}
            className="max-h-full"
          />
        )}
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center p-4 text-white">
        <button onClick={prevStory}>◀</button>

        <button onClick={reactStory}>
          ❤️ React
        </button>

        <button onClick={nextStory}>▶</button>
      </div>
    </div>
  );
};

export default StoryViewer;