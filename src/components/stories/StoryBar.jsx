import React, {
  useEffect,
  useState,
} from "react";

import { API_BASE } from "../../api/api";

import StoryCard from "./StoryCard";
import StoryViewer from "./StoryViewer";

import { getSocket } from "../../socket";

const StoryBar = () => {

  const socket = getSocket();

  const [stories, setStories] =
    useState([]);

  const [selectedStory, setSelectedStory] =
    useState(null);

  const [viewedStories, setViewedStories] =
    useState([]);

  /* ================= FETCH STORIES ================= */

  useEffect(() => {

    const fetchStories =
      async () => {

        try {

          const token =
            localStorage.getItem(
              "token"
            );

          const res =
            await fetch(
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

          setStories(data);

        } catch (err) {

          console.error(
            "Fetch stories error:",
            err
          );
        }
      };

    fetchStories();

  }, []);

  /* ================= SOCKET EVENTS ================= */

  useEffect(() => {

    if (!socket) return;

    const handleNewStory =
      (story) => {

        setStories((prev) => [
          story,
          ...prev,
        ]);
      };

    socket.on(
      "new-story",
      handleNewStory
    );

    return () => {

      socket.off(
        "new-story",
        handleNewStory
      );
    };

  }, [socket]);

  /* ================= OPEN STORY ================= */

  const openStory = (
    story
  ) => {

    setSelectedStory(
      story
    );

    if (
      !viewedStories.includes(
        story._id
      )
    ) {
      setViewedStories(
        (prev) => [
          ...prev,
          story._id,
        ]
      );
    }
  };

  /* ================= LIKE STORY ================= */

  const handleLike =
    async (story) => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
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

        const data =
          await res.json();

        setStories((prev) =>
          prev.map((s) =>
            s._id === story._id
              ? {
                  ...s,
                  likes:
                    data.likes,
                }
              : s
          )
        );

      } catch (err) {

        console.error(
          "Like story error:",
          err
        );
      }
    };

  /* ================= SHARE STORY ================= */

  const handleShare =
    async (story) => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        // backend share count
        await fetch(
          `${API_BASE}/api/stories/share/${story._id}`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        // native share
        if (
          navigator.share
        ) {

          await navigator.share(
            {
              title:
                "Afribook Story",

              url:
                story.media?.[0]
                  ?.url,
            }
          );
        }

      } catch (err) {

        if (
          err.name !==
          "AbortError"
        ) {

          console.error(
            "Share story error:",
            err
          );
        }
      }
    };

  return (
    <>
      {/* STORIES ROW */}

      <div
        className="
          flex
          gap-4
          overflow-x-auto
          py-3
          px-2
          scrollbar-hide
        "
      >
        {stories.map(
          (story) => (
            <StoryCard
              key={
                story._id
              }

              story={
                story
              }

              viewed={viewedStories.includes(
                story._id
              )}

              onOpen={
                openStory
              }
            />
          )
        )}
      </div>

      {/* STORY VIEWER */}

      {selectedStory && (
        <StoryViewer
          story={
            selectedStory
          }

          onClose={() =>
            setSelectedStory(
              null
            )
          }

          onLike={
            handleLike
          }

          onShare={
            handleShare
          }
        />
      )}
    </>
  );
};

export default StoryBar;