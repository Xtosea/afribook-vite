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

  const [selectedStory, setSelectedStory] = useState(null);
  const [viewedStories, setViewedStories] = useState([]);
  const [activeStories, setActiveStories] = useState([]);
  const [opening, setOpening] = useState(false);
  const [showCreator, setShowCreator] = useState(false);


useEffect(() => {
  console.log(
    "showCreator CHANGED:",
    showCreator
  );
}, [showCreator]);

useEffect(() => {
  console.log("StoryBar Mounted");

  return () => {
    console.log("StoryBar Unmounted");
  };
}, []);

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

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!socket) return;

    socket.on("story-view", ({ storyId, viewsCount }) => {
      setActiveStories((prev) =>
        prev.map((s) =>
          s._id === storyId ? { ...s, viewsCount } : s
        )
      );
    });

    socket.on("story-reacted", ({ storyId, reactions }) => {
      setActiveStories((prev) =>
        prev.map((s) =>
          s._id === storyId ? { ...s, reactions } : s
        )
      );
    });

    return () => {
      socket.off("story-view");
      socket.off("story-reacted");
    };
  }, [socket]);

  /* ================= CREATE STORY ================= */
  const handleCreateStory = () => {
  console.log("OPENING STORY CREATOR");

  setShowCreator(true);

  setTimeout(() => {
    console.log(
      "AFTER 1 SECOND:",
      showCreator
    );
  }, 1000);
};

  /* ================= UPLOAD STORY ================= */
  const handleUpload = async (formData) => {
    try {
      const story = await uploadStory(formData);

      if (story) {
        setActiveStories((prev) => [story, ...prev]);
      }

      return story;
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
          headers: { Authorization: `Bearer ${token}` },
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
        await navigator.share({ title: "Story", url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied");
      }
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  /* ================= NEXT STORY ================= */
  const nextStory = () => {
    if (!selectedStory) return;

    const currentIndex = activeStories.findIndex(
      (s) => s._id === selectedStory._id
    );

    const next = activeStories.find(
      (s, i) =>
        i > currentIndex && !viewedStories.includes(s._id)
    );

    if (next) {
      setSelectedStory(next);
      setViewedStories((prev) => [...prev, next._id]);
    } else {
      setSelectedStory(null);
    }
  };

  useEffect(() => {
    window.nextStory = nextStory;
    return () => delete window.nextStory;
  }, [selectedStory, activeStories]);

  return (
    <>
      <div className="relative z-[9999] flex gap-4 overflow-x-auto py-3 px-3 scrollbar-hide">

        {/* CREATE STORY */}
 <div
  onClick={() => {
    alert("CREATE STORY CLICKED");
    console.log("CREATE STORY CLICKED");
  }}
  className="
    relative
    min-w-[110px]
    h-[190px]
    rounded-2xl
    overflow-hidden
    cursor-pointer
    shadow-lg
    bg-red-600
    border-4
    border-yellow-400
    z-[9999]
  "
>
          <img
            src={
              user?.profilePic ||
              localStorage.getItem("profilePic") ||
              "/default-avatar.png"
            }
            className="w-full h-[140px] object-cover"
          />

          <div className="absolute top-[120px] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-blue-600 border-4 border-white flex items-center justify-center text-white text-2xl font-bold">
            +
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[30px] bg-white flex items-end justify-center pb-2">
            <p className="text-black text-xs font-semibold">
              {loading ? `Uploading ${progress}%` : "Create Story"}
            </p>
          </div>

          <input
            type="file"
            ref={fileRef}
            className="hidden"
            accept="image/*,video/*,audio/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              handleUpload({
                file,
                text: "",
                music: null,
                stickers: [],
                backgroundColor: "#000000",
              });
            }}
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
    onClose={() => setShowCreator(false)}
    onSelectFile={handleUpload}
  />
)}

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