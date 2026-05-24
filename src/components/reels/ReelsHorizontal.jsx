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

    if (!Array.isArray(reels)) return;

    const observer =
      new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            const index = Number(
              entry.target.dataset.index
            );

            if (entry.isIntersecting) {

              setActiveIndex(index);

              entry.target
                .play()
                .catch(() => {});

            } else {

              entry.target.pause();

            }
          });
        },
        { threshold: 0.6 }
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
    <div
      className="
        flex
        gap-3
        overflow-x-auto
        p-3
        snap-x
        scrollbar-hide
      "
    >

      {Array.isArray(reels) &&
        reels.map((reel, i) => (

          <div
            key={reel._id}
            className="
              min-w-[180px]
              h-[300px]
              rounded-xl
              overflow-hidden
              relative
              snap-center
              bg-black
              flex-shrink-0
            "
          >

            <video
              ref={(el) =>
                (videoRefs.current[i] = el)
              }
              data-index={i}
              src={
                reel.media?.[0]?.url
              }
              className="
                w-full
                h-full
                object-cover
              "
              muted
              loop
              playsInline
            />

            {/* overlay */}
            <div
              className="
                absolute
                bottom-0
                w-full
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
  );
};

export default ReelsHorizontal;