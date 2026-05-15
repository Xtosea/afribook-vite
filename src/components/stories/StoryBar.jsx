import React, {
  useState,
} from "react";

import StoryCard from "./StoryCard";
import StoryViewer from "./StoryViewer";
import { getSocket } from "../../socket";
import { useStoryUpload } from "../../hooks/useStoryUpload";

const StoryBar = ({
  stories = [],
}) => {
  const [selectedStory, setSelectedStory] =
    useState(null);

  const [viewedStories, setViewedStories] =
    useState([]);

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

        setActiveStories(
          data
        );

      } catch (err) {

        console.error(
          err
        );
      }
    };

  fetchStories();

}, []);


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

  const handleLike = async (
  story
) => {
  try {
    const token =
      localStorage.getItem(
        "token"
      );

    const res = await fetch(
      `${API_BASE}/api/stories/like/${story._id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data =
      await res.json();

    console.log(data);

  } catch (err) {
    console.error(
      "Like story error:",
      err
    );
  }
};

  const handleShare = async (
    story
  ) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Story",
          url:
            story.media?.[0]?.url,
        });
      }
    } catch (err) {
      if (
        err.name !==
        "AbortError"
      ) {
        console.error(err);
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
          px-2
          scrollbar-hide
        "
      >
        {stories.map((story) => (
          <StoryCard
            key={story._id}
            story={story}
            viewed={viewedStories.includes(
              story._id
            )}
            onOpen={openStory}
          />
        ))}
      </div>

      <StoryViewer
        story={selectedStory}
        onClose={() =>
          setSelectedStory(null)
        }
        onLike={handleLike}
        onShare={handleShare}
      />
    </>
  );
};

export default StoryBar;