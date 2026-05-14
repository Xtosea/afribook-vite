import React, { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE } from "../../api/api";

const PhotosSection = ({ posts = [], user }) => {
  const token = localStorage.getItem("token");

  /* ================= SAFE IMAGES ================= */
  const images = useMemo(() => {
    if (!Array.isArray(posts)) return [];

    return posts.flatMap((post) =>
      (post?.media || [])
        .filter((m) => m?.type === "image")
        .map((m) => ({
          ...m,
          postId: post._id,
          likes: post.likes || [],
          comments: post.comments || [],
        }))
    );
  }, [posts]);

  /* ================= STATE ================= */
  const [viewerIndex, setViewerIndex] = useState(null);
  const [likesState, setLikesState] = useState({});
  const [saved, setSaved] = useState({});
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [likedAnim, setLikedAnim] = useState(false);

  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const lastTap = useRef(0);

  const current = viewerIndex !== null ? images[viewerIndex] : null;

  /* ================= INIT LIKES ================= */
  useEffect(() => {
    const obj = {};
    images.forEach((img) => {
      obj[img.postId] = img.likes?.length || 0;
    });
    setLikesState(obj);
  }, [images]);

  /* ================= LIKE ================= */
  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setLikesState((prev) => ({
        ...prev,
        [postId]: data.likes.length,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SAVE ================= */
  const handleSave = (postId) => {
    setSaved((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  /* ================= COMMENT ================= */
  const handleComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      await fetch(`${API_BASE}/api/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: commentText }),
      });

      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SHARE ================= */
  const handleShare = async (url) => {
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= DOUBLE TAP LIKE ================= */
  const handleDoubleTap = (postId) => {
    const now = Date.now();

    if (now - lastTap.current < 300) {
      handleLike(postId);
      setLikedAnim(true);
      setTimeout(() => setLikedAnim(false), 600);
    }

    lastTap.current = now;
  };

  /* ================= SWIPE ================= */
  const onTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    const dx = touchStartX.current - e.changedTouches[0].clientX;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 50) next();
      else if (dx < -50) prev();
    } else {
      if (dy > 50) next();
      else if (dy < -50) prev();
    }
  };

  /* ================= NAV ================= */
  const next = () => {
    setViewerIndex((prev) =>
      prev < images.length - 1 ? prev + 1 : prev
    );
  };

  const prev = () => {
    setViewerIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-4">

      {/* GRID */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Photos</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[700px] overflow-y-auto">

          {images.map((img, i) => (
            <div key={i} className="relative">

              <img
                src={img.url}
                onClick={() => setViewerIndex(i)}
                className="h-52 w-full object-cover rounded-xl cursor-pointer"
              />

              {/* ACTIONS */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-xs flex justify-between px-2 py-1 rounded-lg">

                <button onClick={() => handleLike(img.postId)}>
                  ❤️ {likesState[img.postId] || 0}
                </button>

                <button onClick={() => setViewerIndex(i)}>
                  💬 {img.comments?.length || 0}
                </button>

                <button onClick={() => handleShare(img.url)}>
                  🔗
                </button>

              </div>

            </div>
          ))}

        </div>
      </div>

      {/* FULLSCREEN VIEWER */}
      {current && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">

          {/* BLUR BACKGROUND */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={() => setViewerIndex(null)}
          />

          {/* CLOSE */}
          <button
            onClick={() => setViewerIndex(null)}
            className="absolute top-4 right-4 text-white text-3xl z-50"
          >
            ✕
          </button>

          {/* SAVE */}
          <button
            onClick={() => handleSave(current.postId)}
            className="absolute top-4 left-4 text-white z-50"
          >
            {saved[current.postId] ? "💾 Saved" : "📌 Save"}
          </button>

          {/* IMAGE */}
          <div
            className="relative z-50"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onClick={() => handleDoubleTap(current.postId)}
          >
            <img
              src={current.url}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl"
            />

            {/* ❤️ ANIMATION */}
            {likedAnim && (
              <div className="absolute inset-0 flex items-center justify-center text-red-500 text-7xl animate-ping">
                ❤️
              </div>
            )}
          </div>

          {/* NAV */}
          <button onClick={prev} className="absolute left-4 text-white text-4xl z-50">‹</button>
          <button onClick={next} className="absolute right-4 text-white text-4xl z-50">›</button>

          {/* ACTION BAR */}
          <div className="absolute bottom-4 text-white flex gap-6 z-50">

            <button onClick={() => handleLike(current.postId)}>
              ❤️ {likesState[current.postId] || 0}
            </button>

            <button onClick={() => setShowComments(true)}>
              💬 Comments
            </button>

            <button onClick={() => handleShare(current.url)}>
              🔗 Share
            </button>

          </div>

          {/* COMMENTS SHEET */}
          {showComments && (
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 z-50 max-h-[60vh] overflow-y-auto">

              <h3 className="font-bold mb-2">Comments</h3>

              <div className="space-y-2 mb-3">
                {current.comments?.map((c, i) => (
                  <div key={i} className="bg-gray-100 p-2 rounded">
                    {c.text}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 border p-2 rounded"
                  placeholder="Write comment..."
                />

                <button
                  onClick={() => handleComment(current.postId)}
                  className="bg-blue-600 text-white px-4 rounded"
                >
                  Send
                </button>
              </div>

              <button
                onClick={() => setShowComments(false)}
                className="mt-3 text-red-500"
              >
                Close
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default PhotosSection;