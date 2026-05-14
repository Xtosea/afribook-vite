import React, { useState, useEffect } from "react";
import { API_BASE, fetchWithToken } from "../../api/api";

const PhotosSection = ({ posts = [], user = {}, token }) => {
  const safePosts = Array.isArray(posts) ? posts : [];

  const [activeImage, setActiveImage] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const images = safePosts.flatMap((post) =>
    Array.isArray(post.media)
      ? post.media
          .filter((m) => m?.type === "image")
          .map((m) => ({
            ...m,
            postId: post._id,
          }))
      : []
  );

  /* ================= LIKE ================= */
  const handleLike = async (img) => {
    try {
      await fetchWithToken(
        `${API_BASE}/api/photos/${img.postId}/like`,
        token,
        { method: "POST" }
      );

      setActiveImage((prev) =>
        prev ? { ...prev, liked: !prev.liked } : prev
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SHARE ================= */
  const handleShare = async (img) => {
    try {
      await fetchWithToken(
        `${API_BASE}/api/photos/${img.postId}/share`,
        token,
        { method: "POST" }
      );

      alert("Shared successfully 🚀");
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= OPEN COMMENTS ================= */
  const openComments = async (img) => {
    setActiveImage(img);
    setLoadingComments(true);

    try {
      const data = await fetchWithToken(
        `${API_BASE}/api/photos/${img.postId}/comments`,
        token
      );

      setComments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  /* ================= ADD COMMENT ================= */
  const sendComment = async () => {
    if (!commentText.trim()) return;

    try {
      const newComment = await fetchWithToken(
        `${API_BASE}/api/photos/${activeImage.postId}/comment`,
        token,
        {
          method: "POST",
          body: JSON.stringify({ text: commentText }),
        }
      );

      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">

      {/* ================= PROFILE MEDIA ================= */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Profile Media</h2>

        <div className="flex gap-3 overflow-x-auto">
          {user.profilePic && (
            <img
              src={user.profilePic}
              onClick={() =>
                setActiveImage({
                  url: user.profilePic,
                  type: "profile",
                })
              }
              className="w-32 h-32 rounded-xl object-cover cursor-pointer"
            />
          )}

          {user.coverPhoto && (
            <img
              src={user.coverPhoto}
              onClick={() =>
                setActiveImage({
                  url: user.coverPhoto,
                  type: "cover",
                })
              }
              className="w-32 h-32 rounded-xl object-cover cursor-pointer"
            />
          )}
        </div>
      </div>

      {/* ================= PHOTOS GRID ================= */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Photos</h2>

        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              onClick={() => openComments(img)}
              className="h-32 w-full object-cover rounded-lg cursor-pointer"
            />
          ))}
        </div>
      </div>

      {/* ================= FULL SCREEN VIEW ================= */}
      {activeImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex">

          {/* LEFT IMAGE */}
          <div className="flex-1 flex items-center justify-center">
            <img
              src={activeImage.url}
              className="max-h-[90vh] object-contain"
            />
          </div>

          {/* RIGHT PANEL (Instagram style) */}
          <div className="w-[350px] bg-white flex flex-col">

            {/* ACTIONS */}
            <div className="flex gap-4 p-3 border-b">

              <button onClick={() => handleLike(activeImage)}>
                ❤️ Like
              </button>

              <button onClick={() => handleShare(activeImage)}>
                🔁 Share
              </button>

            </div>

            {/* COMMENTS */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">

              {loadingComments ? (
                <p>Loading...</p>
              ) : (
                comments.map((c, i) => (
                  <div key={i} className="text-sm border-b pb-2">
                    <b>{c.user?.name}</b>
                    <p>{c.text}</p>
                  </div>
                ))
              )}

            </div>

            {/* COMMENT INPUT */}
            <div className="p-3 border-t flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border p-2 rounded"
              />

              <button onClick={sendComment}>
                Post
              </button>
            </div>

          </div>

          {/* CLOSE */}
          <button
            onClick={() => setActiveImage(null)}
            className="absolute top-3 right-3 text-white text-2xl"
          >
            ✖
          </button>

        </div>
      )}
    </div>
  );
};

export default PhotosSection;