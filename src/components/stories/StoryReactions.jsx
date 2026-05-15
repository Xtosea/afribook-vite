import React from "react";

const reactions = [
  "❤️",
  "😂",
  "😮",
  "😢",
  "👍",
];

const StoryReactions = ({
  onReact,
}) => {

  return (
    <div
      className="
        absolute
        bottom-24
        right-4
        bg-black/70
        backdrop-blur-md
        rounded-full
        px-3
        py-2
        flex
        gap-3
        animate-fadeIn
      "
    >
      {reactions.map(
        (reaction) => (
          <button
            key={reaction}
            onClick={() =>
              onReact(reaction)
            }
            className="
              text-2xl
              hover:scale-125
              transition
            "
          >
            {reaction}
          </button>
        )
      )}
    </div>
  );
};

export default StoryReactions;