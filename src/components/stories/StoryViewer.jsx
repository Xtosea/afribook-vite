import React, { useEffect, useState, useRef } from "react";
import { API_BASE } from "../../api/api";

const StoryViewer = ({ stories = [], index = 0, onClose }) => {
  const [current, setCurrent] = useState(index);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef();

  const story = stories[current];

  /* ================= AUTO PROGRESS ================= */
  useEffect(() => {
    setProgress(0);
    if (!story) return;

    const duration = story.type === "video" ? 10000 : 5000;

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
  }, [current, story]);

  /* ================= RECORD VIEW ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!story?._id) return;

    fetch(`${API_BASE}/api/stories/view/${story._id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(console.error);
  }, [current, story]);

  /* ================= SWIPE HANDLER ================= */
  useEffect(() => {
    if (!containerRef.current) return;
    let startX = 0;

    const handleTouchStart = (e) => { startX = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
      const endX = e.changedTouches[0].clientX;
      if (endX - startX > 50) prevStory();
      else if (startX - endX > 50) nextStory();
    };

    const container = containerRef.current;
    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [current]);

  const nextStory = () => {
    if (current < stories.length - 1) setCurrent(current + 1);
    else onClose();
  };

  const prevStory = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const reactStory = async (type = "❤️") => {
    const token = localStorage.getItem("token");
    if (!story?._id) return;

    await fetch(`${API_BASE}/api/stories/react/${story._id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
  };

  if (!story) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex flex-col"
      onClick={onClose}
    >
      {/* PROGRESS BARS */}
      <div className="flex gap-1 p-2">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-1 bg-gray-600 rounded">
            <div
              className="h-1 bg-white rounded"
              style={{
                width: i === current ? `${progress}%` : i < current ? "100%" : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center p-3 text-white pointer-events-none">
        <div className="flex items-center gap-2">
          <img src={story.user?.profilePic} className="w-8 h-8 rounded-full" />
          <span>{story.user?.name}</span>
        </div>
        <span>{story.views?.length || 0} 👁</span>
      </div>

      {/* MEDIA */}
      <div className="flex-1 flex items-center justify-center">
        {story.type === "video" ? (
          <video src={story.media} autoPlay controls className="max-h-full" />
        ) : (
          <img src={story.media} className="max-h-full" alt="story" />
        )}
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center p-4 text-white pointer-events-auto">
        <button onClick={(e) => { e.stopPropagation(); prevStory(); }}>◀ Prev</button>
        <button onClick={(e) => { e.stopPropagation(); reactStory(); }}>❤️ React</button>
        <button onClick={(e) => { e.stopPropagation(); nextStory(); }}>Next ▶</button>
      </div>
    </div>
  );
};

export default StoryViewer;