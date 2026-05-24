import React, {
  useRef,
  useState,
  useEffect,
} from "react";

const ReelsHorizontal = ({
  reels = [],
}) => {

  const videoRefs = useRef([]);

  const [activeIndex, setActiveIndex] =
    useState(0);

  useEffect(() => {

    const observer =
      new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            const index = Number(
              entry.target.dataset.index
            );

            if (entry.isIntersecting) {

              setActiveIndex(index);

              entry.target.play().catch(() => {});

            } else {

              entry.target.pause();

            }
          });
        },
        {
          threshold: 0.6,
        }
      );

    videoRefs.current.forEach(
      (video) => {

        if (video)
          observer.observe(video);
      }
    );

    return () => {

      videoRefs.current.forEach(
        (video) => {

          if (video)
            observer.unobserve(video);
        }
      );
    };

  }, [reels]);

  return (
    <div className="px-3">

      <h2 className="text-lg font-bold mb-3">
        Reels
      </h2>

      {(!reels || reels.length === 0) && (
        <div className="text-gray-500">
          No reels available
        </div>
      )}

      <div
        className="
          flex
          gap-3
          overflow-x-auto
          scrollbar-hide
          snap-x
        "
      >

        {Array.isArray(reels) &&
          reels.map((reel, i) => (

            <div
              key={reel._id}
              className="
                min-w-[180px]
                h-[300px]
                rounded-2xl
                overflow-hidden
                relative
                snap-center
                bg-black
                shrink-0
              "
            >

              <video
                ref={(el) =>
                  (videoRefs.current[i] = el)
                }
                data-index={i}

                src={reel.videoUrl || reel.media?.[0]?.url}

                className="
                  w-full
                  h-full
                  object-cover
                "
                muted
                loop
                playsInline
              />

              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  right-0
                  p-2
                  bg-gradient-to-t
                  from-black
                  text-white
                  text-xs
                "
              >
                {reel.user?.name ||
                  "Unknown"}
              </div>

            </div>
          ))}
      </div>
    </div>
  );
};

export default ReelsHorizontal;