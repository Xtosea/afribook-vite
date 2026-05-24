import React, {
  useRef,
  useEffect,
} from "react";

import { useNavigate } from "react-router-dom";

const ReelsHorizontal = ({
  reels = [],
}) => {

  const navigate = useNavigate();

  const videoRefs = useRef([]);

  // SHOW ONLY 3 REELS
  const previewReels = reels.slice(0, 3);

  /* ================= AUTOPLAY ================= */

  useEffect(() => {

    const observer =
      new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            const video = entry.target;

            if (entry.isIntersecting) {

              video.play().catch(() => {});

            } else {

              video.pause();

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

  }, [previewReels]);

  return (
    <div className="px-3">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">

        <h2 className="text-lg font-bold">
          Reels
        </h2>

        <button
          onClick={() =>
            navigate("/reels")
          }
          className="
            text-blue-500
            text-sm
            font-semibold
          "
        >
          See all
        </button>

      </div>

      {/* EMPTY */}
      {previewReels.length === 0 && (
        <div className="text-gray-500">
          No reels available
        </div>
      )}

      {/* REELS */}
      <div
        className="
          flex
          gap-3
          overflow-x-auto
          scrollbar-hide
          pb-1
        "
      >

        {previewReels.map((reel, i) => (

          <div
            key={reel._id}
            onClick={() =>
              navigate("/reels")
            }
            className="
              relative
              min-w-[140px]
              w-[140px]

              aspect-[9/16]

              rounded-2xl
              overflow-hidden
              bg-black
              shrink-0
              cursor-pointer
            "
          >

            {/* VIDEO */}
            <video
              ref={(el) =>
                (videoRefs.current[i] = el)
              }
              src={
                reel.videoUrl ||
                reel.media?.[0]?.url
              }
              className="
                absolute
                inset-0
                w-full
                h-full
                object-cover
                pointer-events-none
              "
              muted
              loop
              playsInline
              preload="metadata"
            />

            {/* OVERLAY */}
            <div
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-black/70
                via-transparent
                to-transparent
              "
            />

            {/* USER */}
            <div
              className="
                absolute
                bottom-2
                left-2
                right-2
                z-10
                text-white
              "
            >

              <p
                className="
                  text-xs
                  font-semibold
                  truncate
                "
              >
                {reel.user?.name ||
                  "Unknown"}
              </p>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default ReelsHorizontal;