import React, { useEffect, useRef, useState, useCallback } from "react";

import { API_BASE } from "../api/api";
import { getSocket } from "../socket";
import { use2Upload } from "../hooks/use2Upload";

import ReelCard from "../components/reels/ReelCard";
import ReelUploadModal from "../components/reels/ReelUploadModal";

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [likes, setLikes] = useState({});
  const [shares, setShares] = useState({});

  const [caption, setCaption] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const videoRefs = useRef([]);
  const observerRef = useRef(null);
  const fileRef = useRef();

  const { uploadFile, loading, progress } = use2Upload();
  const token = localStorage.getItem("token");

  /* ================= FETCH REELS ================= */
  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/posts/reels`);
      const data = await res.json();

      setReels(data);

      const likesObj = {};
      const sharesObj = {};

      data.forEach((reel) => {
        likesObj[reel._id] = reel.likes?.length || 0;
        sharesObj[reel._id] = reel.shares || 0;
      });

      setLikes(likesObj);
      setShares(sharesObj);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= OPTIMIZED AUTOPLAY ================= */
  useEffect(() => {
    if (!reels.length) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          const index = Number(video.dataset.index);

          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            setActiveIndex(index);

            // pause others
            videoRefs.current.forEach((v) => {
              if (v && v !== video) {
                v.pause();
                v.muted = true;
              }
            });

            // play current
            video.muted = false;
            video.play().catch(() => {});
          } else {
            video.pause();
            video.muted = true;
          }
        });
      },
      {
        threshold: [0.4, 0.6, 0.8],
      }
    );

    videoRefs.current.forEach((video) => {
      if (video) observerRef.current.observe(video);
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [reels]);

  /* ================= PRELOAD NEXT ================= */
  useEffect(() => {
    const next = reels[activeIndex + 1];
    const prev = reels[activeIndex - 1];

    [next, prev].forEach((r) => {
      if (!r) return;

      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "video";
      link.href = r.videoUrl || r.media?.[0]?.url;
      document.head.appendChild(link);
    });
  }, [activeIndex, reels]);

  /* ================= LIKE ================= */
  const likeReel = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/posts/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      setLikes((prev) => ({
        ...prev,
        [id]: data.likes.length,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SHARE ================= */
  const shareReel = async (id) => {
    try {
      const reel = reels.find((r) => r._id === id);
      if (!reel) return;

      const url = `${window.location.origin}/reel/${id}`;

      if (navigator.share) {
        await navigator.share({ title: "Reel", url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Copied");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= VIEW ================= */
  const recordView = async (id) => {
    try {
      await fetch(`${API_BASE}/api/posts/reels/view/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">

      {reels.map((reel, i) => (
        <ReelCard
          key={reel._id}
          reel={reel}
          index={i}
          activeIndex={activeIndex}
          reelRef={(el) => (videoRefs.current[i] = el)}
          recordView={recordView}
          likeReel={likeReel}
          shareReel={shareReel}
          likes={likes}
          shares={shares}
        />
      ))}

      <button
        onClick={() => setShowUpload(true)}
        className="fixed bottom-6 right-6 bg-white text-black w-14 h-14 rounded-full text-3xl z-50"
      >
        +
      </button>

      {showUpload && (
        <ReelUploadModal
          preview={preview}
          caption={caption}
          setCaption={setCaption}
          fileRef={fileRef}
          handleFileChange={(e) => setPreview(URL.createObjectURL(e.target.files[0]))}
          uploadReel={async () => {}}
          setShowUpload={setShowUpload}
          progress={progress}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Reels;