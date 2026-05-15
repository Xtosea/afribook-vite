import React from "react";

const StoryProgress = ({
  progress = 0,
}) => {
  return (
    <div
      className="
        absolute
        top-3
        left-3
        right-3
        z-50
      "
    >
      <div
        className="
          w-full
          h-1
          bg-white/30
          rounded-full
          overflow-hidden
        "
      >
        <div
          className="
            h-full
            bg-white
            transition-all
            duration-200
          "
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
};

export default StoryProgress;