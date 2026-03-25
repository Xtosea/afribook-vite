// src/components/layout/StoryViewer.jsx
import React, { useEffect, useState, useRef } from "react";

const STORY_DURATION = 5000; // 5 seconds per story

const StoryViewer = ({ stories = [], onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const progressRef = useRef(null);
  const timeoutRef = useRef(null);

  const currentStory = stories[currentIndex];

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  useEffect(() => {
    if (!currentStory) return;

    // Reset progress
    if (progressRef.current) progressRef.current.style.width = "0%";

    // Animate progress bar
    const start = performance.now();
    const animate = (time) => {
      const elapsed = time - start;
      const percent = Math.min((elapsed / STORY_DURATION) * 100, 100);
      if (progressRef.current) progressRef.current.style.width = `${percent}%`;

      if (elapsed < STORY_DURATION) {
        requestAnimationFrame(animate);
      } else {
        nextStory();
      }
    };

    requestAnimationFrame(animate);

    return () => clearTimeout(timeoutRef.current);
  }, [currentIndex, currentStory]);

  if (!currentStory) return null;

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col justify-center items-center z-50"
      onClick={onClose}
    >
      {/* Progress Bar */}
      <div className="absolute top-4 left-4 right-4 flex gap-1">
        {stories.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 bg-white/30 rounded"
          >
            <div
              ref={i === currentIndex ? progressRef : null}
              className="h-1 bg-white rounded w-0"
            />
          </div>
        ))}
      </div>

      {/* Story Content */}
      {currentStory.type === "video" ? (
        <video
          src={currentStory.media}
          autoPlay
          controls
          className="max-h-full max-w-full"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <img
          src={currentStory.media}
          alt="story"
          className="max-h-full max-w-full"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Navigation */}
      <div
        className="absolute inset-0 flex justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1" onClick={prevStory}></div>
        <div className="flex-1" onClick={nextStory}></div>
      </div>
    </div>
  );
};

export default StoryViewer;