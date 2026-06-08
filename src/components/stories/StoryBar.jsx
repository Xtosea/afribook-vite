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
const handleUpload = async ({
  file,
  text,
  music,
  stickers,
  backgroundColor,
}) => {
  try {
    if (!file) return;

    setLoading(true);

    let mediaUrl = "";
    let mediaType = "";

    /* =========================
       1. IMAGE → CLOUDINARY
    ========================= */
    if (file.type.startsWith("image/")) {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(
        `${API_BASE}/api/storyCloudnary/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!data.url) {
        throw new Error("Image upload failed");
      }

      mediaUrl = data.url;
      mediaType = "image";
    }

    /* =========================
       2. VIDEO / AUDIO → R2
    ========================= */
    else if (
      file.type.startsWith("video/") ||
      file.type.startsWith("audio/")
    ) {
      // STEP 1: get signed URL
      const signedRes = await fetch(
        `${API_BASE}/api/storyR2/signed-url?contentType=${encodeURIComponent(file.type)}`
      );

      const signedData = await signedRes.json();

      if (!signedData.uploadUrl) {
        throw new Error("R2 signed URL failed");
      }

      // STEP 2: upload to R2
      await axios.put(signedData.uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      mediaUrl = signedData.fileUrl;
      mediaType = file.type.startsWith("video/")
        ? "video"
        : "audio";
    }

    /* =========================
       3. SAVE STORY TO DB
    ========================= */
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/api/storyR2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text,
        music,
        stickers,
        backgroundColor,
        media: [
          {
            url: mediaUrl,
            type: mediaType,
          },
        ],
      }),
    });

    const story = await res.json();

    setActiveStories((prev) => [story, ...prev]);

    return story;
  } catch (err) {
    console.error("Upload story error:", err);
  } finally {
    setLoading(false);
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