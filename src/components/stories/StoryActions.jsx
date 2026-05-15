import React from "react";

const StoryActions = ({
  story,
  onLike,
  onReply,
  onShare,
}) => {
  return (
    <div
      className="
        absolute
        bottom-5
        right-5
        flex
        flex-col
        gap-5
        z-50
      "
    >
      {/* LIKE */}
      <button
        onClick={() =>
          onLike(story)
        }
        className="
          flex
          flex-col
          items-center
          text-white
        "
      >
        <span className="text-3xl">
          ❤️
        </span>

        <span className="text-xs">
          {story.reactions
            ?.length || 0}
        </span>
      </button>

      {/* REPLY */}
      <button
        onClick={() =>
          onReply(story)
        }
        className="
          flex
          flex-col
          items-center
          text-white
        "
      >
        <span className="text-3xl">
          💬
        </span>

        <span className="text-xs">
          {story.replies
            ?.length || 0}
        </span>
      </button>

      {/* SHARE */}
      <button
        onClick={() =>
          onShare(story)
        }
        className="
          flex
          flex-col
          items-center
          text-white
        "
      >
        <span className="text-3xl">
          📤
        </span>

        <span className="text-xs">
          {story.shares || 0}
        </span>
      </button>

      {/* VIEWS */}
      <div
        className="
          flex
          flex-col
          items-center
          text-white
        "
      >
        <span className="text-3xl">
          👁
        </span>

        <span className="text-xs">
          {story.views
            ?.length || 0}
        </span>
      </div>
    </div>
  );
};

export default StoryActions;