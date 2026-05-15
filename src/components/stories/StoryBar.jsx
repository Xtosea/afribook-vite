import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import StoryCard from "./StoryCard";
import StoryViewer from "./StoryViewer";

import { API_BASE } from "../../api/api";
import { useStoryUpload } from "../../hooks/useStoryUpload";

import { getSocket } from "../../socket"; // adjust path if needed

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

  // ================= FETCH STORIES =================
  const fetchStories = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/stories`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await res.json();

      console.log(
        "Fetched stories:",
        data
      );

      setActiveStories(
        Array.isArray(data.stories)
          ? data.stories
          : []
      );

    } catch (err) {

      console.error(
        "Fetch stories error:",
        err
      );
    }
  };


  useEffect(() => {

    fetchStories();

  }, []);

  // ================= SOCKET STORY VIEWS =================
  useEffect(() => {

    if (!socket) return;

    const handleViewUpdate = ({
      storyId,
      viewsCount,
    }) => {

      setActiveStories((prev) =>
        prev.map((story) =>
          story._id === storyId
            ? {
                ...story,
                viewsCount,
              }
            : story
        )
      );

      // also update selected story if open
      setSelectedStory((prev) => {

        if (!prev) return prev;

        if (prev._id === storyId) {

          return {
            ...prev,
            viewsCount,
          };
        }

        return prev;
      });
    };

    socket.on(
      "story-view",
      handleViewUpdate
    );

    return () => {

      socket.off(
        "story-view",
        handleViewUpdate
      );
    };

  }, [socket]);

  // ================= CREATE STORY =================
  const handleCreateStory = () => {

    fileRef.current?.click();

  };

  // ================= UPLOAD STORY =================
  const handleUpload = async (e) => {

    const file =
      e.target.files[0];

    if (!file) return;

    try {

      const newStory =
        await uploadStory(file);

      console.log(
        "Uploaded story:",
        newStory
      );

      // instantly add to UI
      setActiveStories((prev) => [
        newStory,
        ...prev,
      ]);

    } catch (err) {

      console.error(
        "Upload story error:",
        err
      );
    }
  };

  // ================= OPEN STORY =================
  const openStory = (story) => {

    setSelectedStory(story);

    if (
      !viewedStories.includes(
        story._id
      )
    ) {

      setViewedStories((prev) => [
        ...prev,
        story._id,
      ]);

    }
  };

  // ================= LIKE =================
  const handleLike = async (
    story
  ) => {

    try {

      const token =
        localStorage.getItem(
          "token"
        );

      await fetch(
        `${API_BASE}/api/stories/like/${story._id}`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    } catch (err) {

      console.error(
        "Like story error:",
        err
      );
    }
  };

  // ================= SHARE =================
  const handleShare = async (
    story
  ) => {

    try {

      const url =
        story.media?.[0]?.url;

      if (!url) return;

      if (navigator.share) {

        await navigator.share({
          title: "Story",
          url,
        });

      } else {

        await navigator.clipboard.writeText(
          url
        );

        alert("Link copied");

      }

    } catch (err) {

      if (
        err.name !==
        "AbortError"
      ) {

        console.error(
          "Share error:",
          err
        );
      }
    }
  };

  return (
    <>

      <div
        className="
          flex
          gap-4
          overflow-x-auto
          py-3
          px-3
          scrollbar-hide
        "
      >

        {/* CREATE STORY */}
        <div
          onClick={
            handleCreateStory
          }
          className="
            min-w-[110px]
            h-[180px]
            rounded-2xl
            bg-gradient-to-b
            from-blue-500
            to-blue-700
            flex
            flex-col
            items-center
            justify-center
            cursor-pointer
            shadow-lg
            relative
            overflow-hidden
          "
        >

          <div
            className="
              w-14
              h-14
              rounded-full
              bg-white
              flex
              items-center
              justify-center
              text-3xl
              font-bold
              text-blue-600
            "
          >
            +
          </div>

          <p
            className="
              text-white
              text-sm
              font-semibold
              mt-3
            "
          >
            {loading
              ? `Uploading ${progress}%`
              : "Create Story"}
          </p>

          {/* HIDDEN INPUT */}
          <input
            type="file"
            ref={fileRef}
            className="hidden"
            accept="image/*,video/*"
            onChange={handleUpload}
          />

        </div>

        {/* STORIES */}
        {activeStories.map(
          (story) => (

            <StoryCard
              key={story._id}
              story={story}
              viewed={viewedStories.includes(
                story._id
              )}
              onOpen={openStory}
            />

          )
        )}

      </div>

      {/* STORY VIEWER */}
      {selectedStory && (

        <StoryViewer
          story={selectedStory}
          onClose={() =>
            setSelectedStory(null)
          }
          onLike={handleLike}
          onShare={handleShare}
        />

      )}

    </>
  );
};

export default StoryBar;