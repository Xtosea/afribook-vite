import React from "react";
import { useNavigate } from "react-router-dom";

const ReelCard = ({
  reel,
  reelRef,
  recordView,
  likeReel,
  shareReel,
  likes,
  shares,
}) => {
  const navigate = useNavigate();
const [showHeart, setShowHeart] = useState(false);
const [buffering, setBuffering] = useState(true);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const handleDoubleTap = () => {
  setShowHeart(true);

  likeReel(reel._id);

  setTimeout(() => {
    setShowHeart(false);
  }, 800);
};


onWaiting={() => setBuffering(true)}
onPlaying={() => setBuffering(false)}

const fetchMoreReels = async () => {
  try {
    const res = await fetch(
      `${API_BASE}/api/posts/reels?page=${page}`
    );

    const data = await res.json();

    if (!data.length) {
      setHasMore(false);
      return;
    }

    setReels((prev) => [...prev, ...data]);

    setPage((prev) => prev + 1);

  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="h-screen snap-start relative bg-black">

      <video
        ref={reelRef}
        src={reel.media[0]?.url}
        className="h-full w-full object-cover"
        loop
        muted
        playsInline
        onPlay={() => recordView(reel._id)}
      />

      onDoubleClick={handleDoubleTap}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">

        <div className="h-full flex flex-col justify-between p-4">

          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() =>
              navigate(`/profile/${reel.user?._id}`)
            }
          >
            <img
              src={
                reel.user?.profilePic ||
                "/default-avatar.png"
              }
              className="w-12 h-12 rounded-full object-cover border-2 border-white"
            />

            <div>
              <h3 className="text-white font-semibold">
                {reel.user?.name || "Unknown User"}
              </h3>
            </div>
          </div>

          <div className="flex justify-between items-end">

            <div className="max-w-xs text-white">
              <p className="bg-black/40 p-3 rounded-xl backdrop-blur-sm">
                {reel.content}
              </p>
            </div>

            <div className="flex flex-col gap-6 text-white items-center">

              <button
                onClick={() => likeReel(reel._id)}
                className="flex flex-col items-center"
              >
                ❤️
                <span className="text-sm">
                  {likes[reel._id] || 0}
                </span>
              </button>

              <button
                onClick={() => shareReel(reel._id)}
                className="flex flex-col items-center"
              >
                🔗
                <span className="text-sm">
                  {shares[reel._id] || 0}
                </span>
              </button>

           {showHeart && (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

    <div className="text-7xl animate-ping">
      ❤️
    </div>

  </div>
)}

{buffering && (
  <div className="absolute inset-0 flex items-center justify-center bg-black/30">

    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />

  </div>
)}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ReelCard;