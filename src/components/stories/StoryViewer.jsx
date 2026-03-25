// src/components/stories/StoryViewer.jsx
import React, { useEffect, useState, useRef } from "react";
import { API_BASE } from "../../api/api";

const StoryViewer = ({ stories = [], index = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(index);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef();

  const currentStory = stories[currentIndex];

  const storyDuration = 5000; // 5 seconds per story

  // Auto-advance progress
  useEffect(() => {
    if (!currentStory) return;

    setProgress(0);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          handleNextStory();
          return 0;
        }
        return prev + 100 / (storyDuration / 100);
      });
    }, 100);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, currentStory]);

  const handleNextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrevStory = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    else onClose();
  };

  if (!currentStory) return null;

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex flex-col justify-center items-center"
      onClick={onClose}
    >
      {/* Progress bars */}
      <div className="absolute top-4 left-2 right-2 flex gap-1">
        {stories.map((_, idx) => (
          <div
            key={idx}
            className="flex-1 h-1 bg-white/30 rounded"
          >
            <div
              className={`h-1 bg-white rounded`}
              style={{ width: idx < currentIndex ? "100%" : idx === currentIndex ? `${progress}%` : "0%" }}
            />
          </div>
        ))}
      </div>

      {/* Story content */}
      {currentStory.type === "video" ? (
        <video
          src={currentStory.media}
          className="max-h-full max-w-full"
          autoPlay
          controls
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <img
          src={currentStory.media}
          className="max-h-full max-w-full"
          alt="story"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Navigation */}
      <div className="absolute inset-0 flex justify-between">
        <div
          className="flex-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handlePrevStory();
          }}
        />
        <div
          className="flex-1 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleNextStory();
          }}
        />
      </div>

      {/* Bottom actions */}
      <div className="absolute bottom-6 flex gap-4 items-center">
        <button
          className="text-white text-2xl"
          onClick={(e) => {
            e.stopPropagation();
            alert("❤️ Reacted!");
          }}
        >
          ❤️
        </button>
        <span className="text-white text-sm">
          {currentStory.views || 0} views
        </span>
      </div>
    </div>
  );
};

export default StoryViewer;