import React, { useEffect, useRef, useState } from "react";

import { API_BASE } from "../../api/api";
import { getSocket } from "../../socket";

import StoryProgress from "./StoryProgress";
import StoryActions from "./StoryActions";
import StoryReplies from "./StoryReplies";
import StoryReactions from "./StoryReactions";
import StoryAnalytics from "./StoryAnalytics";

const StoryViewer = ({
  story,
  onClose,
  onLike,
  onShare,
}) => {
  const socket = getSocket();
  const videoRef = useRef();

  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const [reactions, setReactions] = useState([]);
  const [replies, setReplies] = useState([]);

  const [showReplies, setShowReplies] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  /* ================= SYNC STORY DATA ================= */
  useEffect(() => {
    setReactions(story?.reactions || []);
    setReplies(story?.replies || []);
    setProgress(0);
  }, [story]);

  /* ================= SOCKET: REACTIONS ================= */
  useEffect(() => {
    if (!socket || !story?._id) return;

    const handleReactionUpdate = ({ storyId, reactions }) => {
      if (storyId !== story._id) return;
      setReactions(reactions || []);
    };

    socket.on("story-reacted", handleReactionUpdate);

    return () => {
      socket.off("story-reacted", handleReactionUpdate);
    };
  }, [socket, story?._id]);

  /* ================= SOCKET: REPLIES ================= */
  useEffect(() => {
    if (!socket || !story?._id) return;

    const handleReply = ({ storyId, reply }) => {
      if (storyId !== story._id) return;
      setReplies((prev) => [...prev, reply]);
    };

    socket.on("story-reply", handleReply);

    return () => {
      socket.off("story-reply", handleReply);
    };
  }, [socket, story?._id]);

  /* ================= PLAY / PAUSE ================= */
  useEffect(() => {
    if (!videoRef.current) return;

    if (paused) videoRef.current.pause();
    else videoRef.current.play();
  }, [paused]);

  /* ================= STORY VIEW ================= */
  useEffect(() => {
    if (!story?._id) return;

    const token = localStorage.getItem("token");

    const recordView = async () => {
      try {
        await fetch(`${API_BASE}/api/stories/view/${story._id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error("View error:", err);
      }
    };

    recordView();
  }, [story]);

  /* ================= PROGRESS ================= */
  useEffect(() => {
    let interval;

    if (!paused) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            onClose?.();
            return 100;
          }
          return prev + 1;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [paused, onClose]);

  if (!story) return null;

  const media = story.media?.[0];

  /* ================= REACTION HANDLER ================= */
  const handleReaction = async (reaction) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_BASE}/api/stories/react/${story._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reaction }),
      });

      setReactions((prev) => [...prev, { type: reaction }]);
      setShowReactions(false);

    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="fixed inset-0 bg-black z-[999] flex items-center justify-center">

      {/* CLOSE */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white text-3xl z-50"
      >
        ✕
      </button>

      {/* ANALYTICS BUTTON (OWNER ONLY) */}
      {story.user?._id === currentUser?._id && (
        <button
          onClick={() => setShowAnalytics(true)}
          className="absolute top-5 left-5 text-white text-xl"
        >
          📊
        </button>
      )}

      {/* PROGRESS */}
      <div className="absolute top-3 left-3 right-3 z-50">
        <StoryProgress progress={progress} />
      </div>

      {/* MEDIA */}
      {media?.type === "image" ? (
        <img
          src={media.url}
          className="w-full h-full object-contain"
        />
      ) : (
        <video
          ref={videoRef}
          src={media?.url}
          className="w-full h-full object-contain"
          autoPlay
          playsInline
          loop
          onClick={() => setPaused(!paused)}
        />
      )}

      {/* USER INFO */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent">
        <img
          src={story.user?.profilePic || "/default-avatar.png"}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div>
          <p className="text-white font-semibold">
            {story.user?.name}
          </p>
          <p className="text-xs text-gray-300">Story</p>
        </div>
      </div>

      {/* BOTTOM ACTIONS */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">

        <p className="text-white text-sm mb-2">
  {story.caption}
</p>

<div className="text-white text-sm mb-3">
  {reactions.length || 0} reactions
</div>

<StoryActions
  story={story}
  onLike={() => onLike(story)}
  onReply={() => setShowReplies(true)}
  onShare={() => onShare(story)}
/>
      </div>

      {/* BUTTONS */}
      <button
        onClick={() => setShowReactions(!showReactions)}
        className="absolute bottom-20 right-5 text-white text-2xl"
      >
        😊
      </button>

      <div className="absolute bottom-20 left-5 text-white text-sm">
        👁 {story.viewsCount || 0}
      </div>

      {/* REACTIONS */}
      {showReactions && (
        <StoryReactions onReact={handleReaction} />
      )}

      {/* REACTION COUNTS */}
      <div className="absolute bottom-32 left-5 flex gap-3 text-white text-sm">
        <span>❤️ {reactions.filter(r => r.type === "❤️").length}</span>
        <span>😂 {reactions.filter(r => r.type === "😂").length}</span>
        <span>😮 {reactions.filter(r => r.type === "😮").length}</span>
      </div>

      {/* REPLIES */}
      {showReplies && (
        <StoryReplies
          story={story}
          onClose={() => setShowReplies(false)}
        />
      )}

      {/* ANALYTICS MODAL */}
      {showAnalytics && (
        <StoryAnalytics
          story={story}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </div>
  );
};

export default StoryViewer;