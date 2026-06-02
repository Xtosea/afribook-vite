import React, { useEffect, useRef, useState } from "react";

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
  const fileRef = useRef();
  const socket = getSocket();

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

      // init likes/shares
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

  /* ================= INTERSECTION OBSERVER ================= */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.dataset.index);

          const video = entry.target;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            setActiveIndex(index);
            video.play();
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, [reels]);

  /* ================= RECORD VIEW ================= */
  const recordView = async (id) => {
    try {
      await fetch(`${API_BASE}/api/posts/reels/view/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("recordView error:", err);
    }
  };

  /* ================= LIKE REEL ================= */
  const likeReel = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/posts/${id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setLikes((prev) => ({
        ...prev,
        [id]: data.likes.length,
      }));
    } catch (err) {
      console.error("likeReel error:", err);
    }
  };

  /* ================= SHARE REEL ================= */
  const shareReel = async (id) => {
    try {
      const reel = reels.find((r) => r._id === id);
      if (!reel) return;

      const shareData = {
        title: "Check out this reel",
        text: reel.content || "Watch this reel",
        url: `${window.location.origin}/reel/${id}`,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied");
      }

      const res = await fetch(`${API_BASE}/api/posts/${id}/share`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setShares((prev) => ({
        ...prev,
        [id]: data.shares,
      }));
    } catch (err) {
      console.error("share error:", err);
    }
  };

  /* ================= FILE CHANGE ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  /* ================= UPLOAD REEL ================= */
  const uploadReel = async () => {
  try {
    const file = fileRef.current.files[0];

    if (!file) return alert("Select video");

    // 1. Upload video to R2
    const { videoUrl, thumbnailBlob } = await uploadFile(file);

    // 2. Convert thumbnail blob to file
    let thumbnailUrl = "";

if (thumbnailBlob) {
  const thumbnailFile = new File(
    [thumbnailBlob],
    "thumbnail.jpg",
    { type: "image/jpeg" }
  );

  const fd = new FormData();
  fd.append("file", thumbnailFile);

  const thumbUploadRes = await fetch(
  `${API_BASE}/api/r2/upload-thumbnail`,
  {
    method: "POST",
    body: fd,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

if (!thumbUploadRes.ok) {
  throw new Error("Thumbnail upload failed");
}

const thumbData = await thumbUploadRes.json();

thumbnailUrl = thumbData.thumbnailUrl;
}

    // 4. Create reel in DB
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

    const newReel = await res.json();

    setReels((prev) => [newReel, ...prev]);

    setLikes((prev) => ({
      ...prev,
      [newReel._id]: 0,
    }));

    setShares((prev) => ({
      ...prev,
      [newReel._id]: 0,
    }));

    setCaption("");
    setPreview(null);
    setShowUpload(false);

    if (fileRef.current) fileRef.current.value = null;

  } catch (err) {
    console.error("upload error:", err);
  }
};

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black relative">

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
        className="fixed bottom-6 right-6 bg-white text-black w-14 h-14 rounded-full text-3xl shadow-2xl z-50"
      >
        +
      </button>

      {showUpload && (
        <ReelUploadModal
          preview={preview}
          caption={caption}
          setCaption={setCaption}
          fileRef={fileRef}
          handleFileChange={handleFileChange}
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