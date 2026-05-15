import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { API_BASE } from "../../api/api";

import StoryProgress from "./StoryProgress";
import StoryActions from "./StoryActions";
import StoryReplies from "./StoryReplies";
import StoryReactions from "./StoryReactions";

const StoryViewer = ({
  story,
  onClose,
  onLike,
  onShare,
}) => {
  const videoRef = useRef();

  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const [reactions, setReactions] = useState([]);

  const [showReplies, setShowReplies] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  /* ================= SYNC REACTIONS ================= */
  useEffect(() => {
    setReactions(story?.reactions || []);
  }, [story]);

  /* ================= PLAY / PAUSE ================= */
  useEffect(() => {
    if (videoRef.current && !paused) {
      videoRef.current.play();
    }

    if (videoRef.current && paused) {
      videoRef.current.pause();
    }
  }, [paused]);

  /* ================= STORY VIEW ================= */
  useEffect(() => {
    if (!story?._id) return;

    const token = localStorage.getItem("token");

    const recordView = async () => {
      try {
        await fetch(
          `${API_BASE}/api/stories/view/${story._id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (err) {
        console.error("View error:", err);
      }
    };

    recordView();
  }, [story]);

  /* ================= RESET PROGRESS ================= */
  useEffect(() => {
    setProgress(0);
  }, [story]);

  /* ================= PROGRESS TIMER ================= */
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

  /* ================= REACTION ================= */
  const handleReaction = async (reaction) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(
        `${API_BASE}/api/stories/react/${story._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reaction }),
        }
      );

      // ✅ FIXED: proper state update (NO mutation)
      setReactions((prev) => [
        ...prev,
        { type: reaction },
      ]);

      setShowReactions(false);

    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[999] flex items-center justify-center">

      {/* CLOSE BUTTON */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white text-3xl z-50"
      >
        ✕
      </button>

      {/* PROGRESS */}
      <div className="absolute top-3 left-3 right-3 z-50">
        <StoryProgress progress={progress} />
      </div>

      {/* MEDIA */}
      {media?.type === "image" ? (
        <img
          src={media.url}
          alt=""
          className="w-full h-full object-contain"
        />
      ) : (
        <video
          ref={videoRef}
          src={media?.url}
          className="w-full h-full object-contain"
          autoPlay
          playsInline
          controls={false}
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

      {/* BOTTOM */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">

        <p className="text-white text-sm mb-4">
          {story.caption}
        </p>

        <StoryActions
          story={story}
          onLike={() => onLike(story)}
          onReply={() => setShowReplies(true)}
          onShare={() => onShare(story)}
        />
      </div>

      {/* REACTIONS BUTTON */}
      <button
        onClick={() => setShowReactions(!showReactions)}
        className="absolute bottom-20 right-5 text-white text-2xl"
      >
        😊
      </button>

      {/* VIEWS */}
      <div className="absolute bottom-20 left-5 text-white text-sm">
        👁 {story.viewsCount || 0}
      </div>

      {/* REACTION POPUP */}
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
    </div>
  );
};

export default StoryViewer;