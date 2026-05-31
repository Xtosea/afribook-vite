import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import StoryCard from "./StoryCard";
import StoryViewer from "./StoryViewer";

import { API_BASE } from "../../api/api";
import { useStoryUpload } from "../../hooks/useStoryUpload";

import { getSocket } from "../../socket";

const StoryBar = ({ user }) => {

  const socket = getSocket();

  const fileRef = useRef();

  const {
    uploadStory,
    loading,
    progress,
  } = useStoryUpload();

  const [selectedStory, setSelectedStory] =
    useState(null);

  const [viewedStories, setViewedStories] =
    useState([]);

  const [activeStories, setActiveStories] =
    useState([]);

const [opening, setOpening] = useState(false);




  /* ================= FETCH STORIES ================= */
  const fetchStories = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/api/stories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    const sorted = Array.isArray(data) ? data : [];

    const myStories = sorted.filter(
      (s) => s.user?._id === user?._id
    );

    const others = sorted.filter(
      (s) => s.user?._id !== user?._id
    );

    setActiveStories([...myStories, ...others]);

  } catch (err) {
    console.error("Fetch stories error:", err);
  }
};


  useEffect(() => {
    fetchStories();
  }, []);

  /* ================= SOCKET: VIEWS + REACTIONS ================= */
  useEffect(() => {
    if (!socket) return;

    const handleViewUpdate = ({
      storyId,
      viewsCount,
    }) => {
      setActiveStories((prev) =>
        prev.map((story) =>
          story._id === storyId
            ? { ...story, viewsCount }
            : story
        )
      );

      setSelectedStory((prev) => {
        if (!prev) return prev;
        if (prev._id === storyId) {
          return { ...prev, viewsCount };
        }
        return prev;
      });
    };

    const handleReaction = ({
      storyId,
      reactions,
    }) => {
      setActiveStories((prev) =>
        prev.map((story) =>
          story._id === storyId
            ? { ...story, reactions }
            : story
        )
      );

      setSelectedStory((prev) => {
        if (!prev) return prev;
        if (prev._id === storyId) {
          return { ...prev, reactions };
        }
        return prev;
      });
    };

    socket.on("story-view", handleViewUpdate);
    socket.on("story-reacted", handleReaction);

    return () => {
      socket.off("story-view", handleViewUpdate);
      socket.off("story-reacted", handleReaction);
    };

  }, [socket]);

  /* ================= CREATE STORY ================= */
  const handleCreateStory = () => {
    fileRef.current?.click();
  };

  /* ================= UPLOAD STORY ================= */
  const handleUpload = async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    try {

      const newStory = await uploadStory(file);

      if (newStory?._id) {

  setActiveStories((prev) => [
    newStory,
    ...prev,
  ]);

}

    } catch (err) {
      console.error("Upload story error:", err);
    }
  };

  /* ================= OPEN STORY ================= */
  const openStory = (story) => {
  setOpening(true);
  setSelectedStory(story);

  setTimeout(() => setOpening(false), 200);

  if (!viewedStories.includes(story._id)) {
    setViewedStories((prev) => [...prev, story._id]);
  }
};

  /* ================= LIKE ================= */
  const handleLike = async (story) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(
        `${API_BASE}/api/stories/like/${story._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error("Like story error:", err);
    }
  };

  /* ================= SHARE ================= */
  const handleShare = async (story) => {
    try {
      const url = story.media?.[0]?.url;
      if (!url) return;

      if (navigator.share) {
        await navigator.share({
          title: "Story",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied");
      }

    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Share error:", err);
      }
    }
  };

const nextStory = () => {
  if (!selectedStory) return;

  const currentIndex = activeStories.findIndex(
    (s) => s._id === selectedStory._id
  );

  const next = activeStories.find(
    (s, i) => i > currentIndex && !viewedStories.includes(s._id)
  );

  if (next) {
    setSelectedStory(next);

    setViewedStories((prev) =>
      prev.includes(next._id)
        ? prev
        : [...prev, next._id]
    );
  } else {
    setSelectedStory(null);
  }
};


useEffect(() => {
  window.nextStory = nextStory;

  return () => {
    delete window.nextStory;
  };
}, [selectedStory, activeStories]);

console.log("user profile pic:", user?.profilePic);


  return (
    <>
      <div className="flex gap-4 overflow-x-auto py-3 px-3 scrollbar-hide">

        {/* CREATE STORY */}
<div
  onClick={handleCreateStory}
  className="
    relative
    min-w-[110px]
    h-[190px]
    rounded-2xl
    overflow-hidden
    cursor-pointer
    shadow-lg
    bg-black
  "
>

  {/* PROFILE PICTURE */}
  <div className="absolute inset-0 flex items-center justify-center">
  <img
    src={user?.profilePic || "/default-avatar.png"}
    alt="profile"
    className="w-32 h-32 object-cover rounded-full border-4 border-white"
    onError={(e) => {
      console.log("IMAGE FAILED:", e.target.src);
      e.target.src = "/default-avatar.png";
    }}
  />
</div>

      {/* + BUTTON */}

  <div className="absolute inset-0 bg-black/40" />

  <div
    className="
      absolute
      top-3
      right-3
      w-8
      h-8
      bg-blue-600
      rounded-full
      flex
      items-center
      justify-center
      text-white
      text-xl
      font-bold
    "
  >
    +
  </div>

      {/* TEXT */}

  <div className="absolute bottom-3 left-3 right-3">
    <p className="text-white text-sm font-semibold">
      {loading
        ? `Uploading ${progress}%`
        : "Create Story"}
    </p>
  </div>

  <input
    type="file"
    ref={fileRef}
    className="hidden"
    accept="image/*,video/*"
    onChange={handleUpload}
  />
</div>

        {/* STORIES */}
        {activeStories.map((story) => (
          <StoryCard
            key={story._id}
            story={story}
            viewed={viewedStories.includes(story._id)}
            onOpen={openStory}
          />
        ))}

      </div>

      {/* STORY VIEWER */}
      {selectedStory && (
        <StoryViewer
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          onLike={handleLike}
          onShare={handleShare}
        />
      )}
    </>
  );
};

export default StoryBar;