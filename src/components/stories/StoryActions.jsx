import React, {
  useState,
} from "react";

import { API_BASE } from "../../api/api";

const reactions = [
  {
    type: "like",
    emoji: "👍",
  },

  {
    type: "love",
    emoji: "❤️",
  },

  {
    type: "haha",
    emoji: "😂",
  },

  {
    type: "wow",
    emoji: "😮",
  },

  {
    type: "sad",
    emoji: "😢",
  },

  {
    type: "fire",
    emoji: "🔥",
  },
];

const StoryActions = ({
  story,
  onReply,
  onShare,
}) => {
  const [showReactions, setShowReactions] =
    useState(false);

  const reactToStory =
    async (type) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        await fetch(
          `${API_BASE}/api/stories/react/${story._id}`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
  reaction: type,
})
          }
        );

        setShowReactions(false);

      } catch (err) {
        console.error(err);
      }
    };

  return (
    <div className="flex items-center gap-5">

      {/* REACTIONS */}
      <div className="relative">

        <button
          onClick={() =>
            setShowReactions(
              !showReactions
            )
          }
          className="text-white text-2xl"
        >
          ❤️
        </button>

        {showReactions && (
          <div
            className="
              absolute
              bottom-14
              left-0
              bg-black/80
              backdrop-blur-md
              p-2
              rounded-full
              flex
              gap-2
            "
          >
            {reactions.map(
              (reaction) => (
                <button
                  key={
                    reaction.type
                  }
                  onClick={() =>
                    reactToStory(
                      reaction.type
                    )
                  }
                  className="
                    text-2xl
                    hover:scale-125
                    transition
                  "
                >
                  {
                    reaction.emoji
                  }
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* COMMENT */}
      <button
        onClick={onReply}
        className="text-white text-2xl"
      >
        💬
      </button>

      {/* SHARE */}
      <button
        onClick={() =>
          onShare(story)
        }
        className="text-white text-2xl"
      >
        📤
      </button>

    </div>
  );
};

export default StoryActions;