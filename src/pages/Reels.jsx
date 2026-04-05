import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "../api/api";
import { useNavigate } from "react-router-dom";
import { connectSocket } from "../socket";

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [likes, setLikes] = useState({});
  const [shares, setShares] = useState({});
  const [caption, setCaption] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState(null);

  const videoRefs = useRef([]);
  const fileRef = useRef();

  const navigate = useNavigate();
  const socket = connectSocket();

  /** Fetch reels */
  const fetchReels = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reels`);
      const data = await res.json();
      setReels(data);

      const initialLikes = {};
      const initialShares = {};

      data.forEach((r) => {
        initialLikes[r._id] = r.likes?.length || 0;
        initialShares[r._id] = r.shares || 0;
      });

      setLikes(initialLikes);
      setShares(initialShares);
    } catch (err) {
      console.error(err);
    }
  };

  /** Socket listeners */
  useEffect(() => {
    fetchReels();

    if (!socket) return;

    const handleNewReel = (reel) => {
      setReels((prev) => [reel, ...prev]);
      setLikes((prev) => ({
        ...prev,
        [reel._id]: reel.likes?.length || 0,
      }));
      setShares((prev) => ({
        ...prev,
        [reel._id]: reel.shares || 0,
      }));
    };

    const handleReelLike = ({ reelId, likesCount }) => {
      setLikes((prev) => ({ ...prev, [reelId]: likesCount }));
    };

    const handleReelShare = ({ reelId, shares }) => {
      setShares((prev) => ({ ...prev, [reelId]: shares }));
    };

    socket.on("new-reel", handleNewReel);
    socket.on("reel-like", handleReelLike);
    socket.on("reel-share", handleReelShare);

    return () => {
      socket.off("new-reel", handleNewReel);
      socket.off("reel-like", handleReelLike);
      socket.off("reel-share", handleReelShare);
    };
  }, [socket]);

  /** Auto play videos */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          entry.isIntersecting ? video.play() : video.pause();
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((video) => video && observer.observe(video));

    return () =>
      videoRefs.current.forEach(
        (video) => video && observer.unobserve(video)
      );
  }, [reels]);

  /** Record view */
  const recordView = async (id) => {
    try {
      await fetch(`${API_BASE}/api/reels/view/${id}`, {
        method: "POST",
      });
    } catch (err) {
      console.error(err);
    }
  };

  /** Like */
  const likeReel = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/reels/${id}/like`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setLikes((prev) => ({
        ...prev,
        [id]: data.likesCount,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  /** Share */
  const shareReel = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/reels/${id}/share`, {
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
      console.error(err);
    }
  };

  /** Handle file preview */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  /** Upload reel */
  const uploadReel = async () => {
    const file = fileRef.current.files[0];
    if (!file) return alert("Select video");

    const formData = new FormData();
    formData.append("video", file);
    formData.append("caption", caption);

    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_BASE}/api/reels/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setCaption("");
      setPreview(null);
      setShowUpload(false);
      fileRef.current.value = null;

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black relative">

      {/* Reels */}
      {reels.map((reel, i) => (
        <div key={reel._id} className="h-screen snap-start relative">

          <video
            ref={(el) => (videoRefs.current[i] = el)}
            src={reel.media[0]?.url}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
            onPlay={() => recordView(reel._id)}
          />

          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-4">

            {/* User */}
            <div
              className="flex items-center gap-2 text-white cursor-pointer"
              onClick={() => navigate(`/profile/${reel.user._id}`)}
            >
              <img
                src={reel.user.profilePic}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-semibold">
                {reel.user.name}
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-end">

              {/* Caption */}
              <div className="text-white max-w-xs">
                <p className="bg-black/50 p-2 rounded-lg text-sm">
                  {reel.content}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col items-center gap-5 text-white">

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

              </div>

            </div>

          </div>

        </div>
      ))}

      {/* Floating Upload Button */}
      <button
        onClick={() => setShowUpload(true)}
        className="fixed bottom-6 right-6 bg-white text-black w-14 h-14 rounded-full shadow-lg text-3xl z-50"
      >
        +
      </button>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">

          <div className="bg-gray-900 p-4 rounded-xl w-[90%] max-w-md text-white">

            <h2 className="text-lg font-bold mb-3">
              Create Reel
            </h2>

            {/* Preview */}
            {preview && (
              <video
                src={preview}
                className="w-full h-60 object-cover rounded-lg mb-3"
                controls
              />
            )}

            {/* Caption */}
            <textarea
              placeholder="Write caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-black border border-gray-700 p-2 rounded mb-3"
            />

            {/* Buttons */}
            <div className="flex justify-between">

              <button
                onClick={() => fileRef.current.click()}
                className="bg-gray-700 px-4 py-2 rounded"
              >
                Select Video
              </button>

              <div className="flex gap-2">

                <button
                  onClick={() => {
                    setShowUpload(false);
                    setPreview(null);
                  }}
                  className="bg-red-500 px-4 py-2 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={uploadReel}
                  className="bg-blue-500 px-4 py-2 rounded"
                >
                  Post
                </button>

              </div>

            </div>

            <input
              type="file"
              accept="video/*"
              ref={fileRef}
              className="hidden"
              onChange={handleFileChange}
            />

          </div>

        </div>
      )}

    </div>
  );
};

export default Reels;