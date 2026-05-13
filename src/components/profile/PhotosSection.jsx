import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../../api/api";

const PhotosSection = ({ posts = [], user }) => {
  const token = localStorage.getItem("token");

  // 🧠 SAFE IMAGE EXTRACTION
  const images = useMemo(() => {
    if (!Array.isArray(posts)) return [];

    return posts
      .flatMap((post) =>
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

  const [viewerIndex, setViewerIndex] = useState(null);
  const [likesState, setLikesState] = useState({});
  const [commentText, setCommentText] = useState("");

  // INIT LIKES SAFELY
  useEffect(() => {
    const obj = {};
    images.forEach((img) => {
      obj[img.postId] = img.likes?.length || 0;
    });
    setLikesState(obj);
  }, [images]);

  // ❤️ LIKE
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

  // 💬 COMMENT
  const handleComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: commentText }),
      });

      await res.json();
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  };

  // 🔗 SHARE
  const handleShare = async (url) => {
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Copied link");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ❤️ DOUBLE TAP LIKE
  const handleDoubleTap = (postId) => {
    handleLike(postId);
  };

  // NEXT / PREV VIEWER
  const nextImage = () => {
    setViewerIndex((prev) =>
      prev < images.length - 1 ? prev + 1 : prev
    );
  };

  const prevImage = () => {
    setViewerIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const current = viewerIndex !== null ? images[viewerIndex] : null;

  return (
    <div className="space-y-4">

      {/* PROFILE MEDIA */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">
          Profile Media
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {user?.profilePic && (
            <img
              src={user.profilePic}
              onClick={() => setViewerIndex(0)}
              className="h-48 w-full object-cover rounded-xl cursor-pointer"
            />
          )}

          {user?.coverPhoto && (
            <img
              src={user.coverPhoto}
              className="h-48 w-full object-cover rounded-xl"
            />
          )}
        </div>
      </div>

      {/* PHOTOS GRID */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">
          Photos
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[700px] overflow-y-auto">

          {images.map((img, i) => (
            <div key={i} className="relative">

              <img
                src={img.url}
                onClick={() => setViewerIndex(i)}
                onDoubleClick={() => handleDoubleTap(img.postId)}
                className="h-52 w-full object-cover rounded-xl cursor-pointer"
              />

              {/* OVERLAY ACTIONS */}
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

          {/* CLOSE */}
          <button
            onClick={() => setViewerIndex(null)}
            className="absolute top-4 right-4 text-white text-3xl"
          >
            ✕
          </button>

          {/* PREV */}
          <button
            onClick={prevImage}
            className="absolute left-4 text-white text-4xl"
          >
            ‹
          </button>

          {/* IMAGE */}
          <img
            src={current.url}
            onDoubleClick={() => handleDoubleTap(current.postId)}
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl"
          />

          {/* NEXT */}
          <button
            onClick={nextImage}
            className="absolute right-4 text-white text-4xl"
          >
            ›
          </button>

          {/* ACTION BAR */}
          {current.postId && (
            <div className="absolute bottom-4 text-white flex gap-6 text-lg">

              <button onClick={() => handleLike(current.postId)}>
                ❤️ Like
              </button>

              <button onClick={() => handleShare(current.url)}>
                🔗 Share
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default PhotosSection;