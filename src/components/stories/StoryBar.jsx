import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import StoryCard from "./StoryCard";
import StoryViewer from "./StoryViewer";

import { API_BASE } from "../../api/api";

const StoryBar = ({ user }) => {

  const fileRef = useRef();

  const [selectedStory, setSelectedStory] =
    useState(null);

  const [viewedStories, setViewedStories] =
    useState([]);

  const [activeStories, setActiveStories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // ================= FETCH STORIES =================
  useEffect(() => {

    const fetchStories = async () => {

      try {

        setLoading(true);

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
          "Stories response:",
          data
        );

        // SAFE ARRAY
        if (
          data &&
          Array.isArray(data.stories)
        ) {

          setActiveStories(
            data.stories
          );

        } else {

          setActiveStories([]);

        }

      } catch (err) {

        console.error(
          "Fetch stories error:",
          err
        );

        setActiveStories([]);

      } finally {

        setLoading(false);

      }
    };

    fetchStories();

  }, []);

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

  // ================= CREATE STORY =================
  const handleCreateStory = () => {

    fileRef.current?.click();

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

        {/* CREATE STORY CARD */}
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
            Create Story
          </p>

          <input
            type="file"
            ref={fileRef}
            className="hidden"
            accept="image/*,video/*"
          />

        </div>

        {/* LOADING */}
        {loading && (

          <div className="text-gray-500 text-sm pt-3">
            Loading stories...
          </div>

        )}

        {/* STORIES */}
        {!loading &&
          activeStories.map(
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

        {/* EMPTY */}
        {!loading &&
          activeStories.length === 0 && (

            <div
              className="
                text-gray-500
                text-sm
                flex
                items-center
              "
            >
              No stories yet
            </div>

          )}

      </div>

      {/* VIEWER */}
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