import React, { useEffect, useRef, useState, useCallback } from "react";

import { API_BASE } from "../api/api";
import { getSocket } from "../socket";
import { use2Upload } from "../hooks/use2Upload";
import generateThumbnail from "../utils/generateThumbnail";


import ReelCard from "../components/reels/ReelCard";
import ReelUploadModal from "../components/reels/ReelUploadModal";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [likes, setLikes] = useState({});
  const [shares, setShares] = useState({});

  const [caption, setCaption] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState(null);

  const [activeIndex, setActiveIndex] = useState(0);
const [selectedFile, setSelectedFile] = useState(null);


  const videoRefs = useRef([]);
  const observerRef = useRef(null);
  const fileRef = useRef();
  const navigate = useNavigate();


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

const uploadReel = async () => {
  try {
    if (!selectedFile) {
      alert("Please select a video.");
      return;
    }

    // Upload video
const { videoUrl } = await uploadFile(selectedFile);

// Generate thumbnail
const thumbnailBlob = await generateThumbnail(selectedFile);

// Convert Blob to File
const thumbnailFile = new File(
  [thumbnailBlob],
  "thumbnail.jpg",
  { type: "image/jpeg" }
);

// Upload thumbnail
const { videoUrl: thumbnailUrl } =
  await uploadFile(thumbnailFile);

    const res = await fetch(`${API_BASE}/api/posts/reels`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  caption,
  videoUrl,
  thumbnailUrl,
}),
    });

    if (!res.ok) {
      throw new Error("Failed to upload reel.");
    }

    setCaption("");
    setPreview(null);
    setSelectedFile(null);
    setShowUpload(false);

    fetchReels();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};


  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">

      
      <button
  onClick={() => navigate("/")}
  className="
    fixed
    top-[max(env(safe-area-inset-top),16px)]
    left-4
    z-[100]
    w-12
    h-12
    rounded-full
    bg-black/40
    backdrop-blur-md
    border
    border-white/20
    flex
    items-center
    justify-center
    text-white
    transition-all
    active:scale-95
  "
  aria-label="Back to Home"
>
  <ArrowLeft size={24} strokeWidth={2.5} />
</button>

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
          handleFileChange={(e) => {
  const file = e.target.files[0];
  if (!file) return;

  setSelectedFile(file);
  setPreview(URL.createObjectURL(file));
}}
          uploadReel={uploadReel}
          setShowUpload={setShowUpload}
          progress={progress}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Reels;