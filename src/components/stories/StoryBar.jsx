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
import StoryCreator from "./StoryCreator";


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

const [showCreator, setShowCreator] =
  useState(false);




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
  setShowCreator(true);
};

  /* ================= UPLOAD STORY ================= */
  const handleUpload = async ({ file, text, music }) => {
  try {
    const newStory = await uploadStory(file); // ONLY file goes to R2

    const story = newStory?.story || newStory?.data || newStory;

    if (!story?._id) return;

    const safeStory = {
      ...story,
      text,
      music,
      user: story.user || user,
    };

    setActiveStories((prev) => {
  const exists = prev.some((s) => s._id === safeStory._id);

  if (exists) return prev;

  return [safeStory, ...prev];
});
    
  /* ================= UPLOAD STORY ================= */
const handleUpload = async ({ file, text, music }) => {
  try {
    const newStory = await uploadStory(file); // ONLY file goes to R2

    const story = newStory?.story || newStory?.data || newStory;

    if (!story?._id) return;

    const safeStory = {
      ...story,
      text,
      music,
      user: story.user || user,
    };

    setActiveStories((prev) => {
      const exists = prev.some((s) => s._id === safeStory._id);
      if (exists) return prev;
      return [safeStory, ...prev];
    });

  } catch (err) {
    console.error("Upload story error:", err);
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
  {/* PROFILE IMAGE */}
  <img
  src={
    user?.profilePic ||
    localStorage.getItem("profilePic") ||
    "/default-avatar.png"
  }
  alt="profile"
  className="w-full h-[140px] object-cover"
/>

  {/* PLUS BUTTON */}
  <div
    className="
      absolute
      top-[120px]
      left-1/2
      -translate-x-1/2
      w-10
      h-10
      rounded-full
      bg-blue-600
      border-4
      border-white
      flex
      items-center
      justify-center
      text-white
      text-2xl
      font-bold
    "
  >
    +
  </div>

  {/* BOTTOM AREA */}
  <div
    className="
      absolute
      bottom-0
      left-0
      right-0
      h-[30px]
      bg-white
      flex
      items-end
      justify-center
      pb-2
    "
  >
    <p className="text-black text-xs font-semibold">
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


{showCreator && (
  <StoryCreator
    onClose={() =>
      setShowCreator(false)
    }
    onSelectFile={(formData) => {
  handleUpload(formData);
}}
  />
)}


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