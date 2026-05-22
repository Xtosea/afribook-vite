import React, {
  useEffect,
  useRef,
  useState,
} from "react";

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

  const videoRefs = useRef([]);

  const fileRef = useRef();

  const socket = getSocket();

  const {
    uploadFile,
    loading,
    progress,
  } = use2Upload();

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/posts/reels`
      );

      const data = await res.json();

      setReels(data);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting) {
            video.play();
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: 0.7,
      }
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const uploadReel = async () => {
    try {
      const file = fileRef.current.files[0];

      if (!file) {
        return alert("Select video");
      }

      const uploadedUrl = await uploadFile(file);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/posts/reels`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            caption,
            videoUrl: uploadedUrl,
          }),
        }
      );

   
     const likesObj = {};
const sharesObj = {};

data.forEach((reel) => {
  likesObj[reel._id] =
    reel.likes?.length || 0;

  sharesObj[reel._id] =
    reel.shares || 0;
});

setLikes(likesObj);
setShares(sharesObj);


      const newReel = await res.json();

      setReels((prev) => [newReel, ...prev]);

      setCaption("");
      setPreview(null);
      setShowUpload(false);

      if (fileRef.current) {
        fileRef.current.value = null;
      }

    } catch (err) {
      console.error(err);
    }
  };


  const token =
  localStorage.getItem("token");

  const recordView = async (id) => {
    try {
      await fetch(
  `${API_BASE}/api/posts/reels/view/${id}`,
  {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

  const likeReel = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
  `${API_BASE}/api/posts/${id}/like`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      const data = await res.json();

      setLikes((prev) => ({
  ...prev,
  [id]: data.likes.length,
}));

    } catch (err) {
      console.error(err);
    }
  };

  const shareReel = async (id) => {
  try {
    const reel = reels.find((r) => r._id === id);

    if (!reel) return;

    const shareData = {
      title: "Check out this reel",
      text: reel.content || "Watch this reel",
      url: `${window.location.origin}/reel/${id}`,
    };

    // Native mobile share
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
        if (err.name === "AbortError") {
          return;
        }

        console.error("Share error:", err);
      }
    } else {
      // Fallback copy link
      await navigator.clipboard.writeText(
        shareData.url
      );

      alert("Link copied");
    }

    // Update backend share count
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_BASE}/api/posts/${id}/share`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    setShares((prev) => ({
      ...prev,
      [id]: data.shares,
    }));

  } catch (err) {
    console.error("Share failed:", err);
  }
};

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black relative">

      {reels.map((reel, i) => (
        <ReelCard
          key={reel._id}
          reel={reel}
          reelRef={(el) =>
            (videoRefs.current[i] = el)
          }
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