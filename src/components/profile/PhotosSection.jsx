import React, { useState, useEffect, useRef } from "react";
import { API_BASE, fetchWithToken } from "../../api/api";
import { getSocket } from "../../socket";

const PhotosSection = ({ posts = [], user = {}, token }) => {
  const safePosts = Array.isArray(posts) ? posts : [];

  const socket = getSocket();
  const [activeIndex, setActiveIndex] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  const lastTapRef = useRef(0);

  /* ================= EXTRACT IMAGES ================= */
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

  /* ================= SOCKET REALTIME ================= */
  useEffect(() => {
    if (!socket) return;

    socket.on("photo-comment", ({ photoId, comment }) => {
      setComments((prev) => [comment, ...prev]);
    });

    return () => {
      socket.off("photo-comment");
    };
  }, [socket]);

  /* ================= OPEN IMAGE ================= */
  const openImage = async (index) => {
    setActiveIndex(index);

    try {
      const img = images[index];

      const data = await fetchWithToken(
        `${API_BASE}/api/photos/${img.postId}/comments`,
        token
      );

      setComments(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= DOUBLE TAP LIKE ================= */
  const handleDoubleTap = async (img) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      try {
        await fetchWithToken(
          `${API_BASE}/api/photos/${img.postId}/like`,
          token,
          { method: "POST" }
        );

        // instant UI feedback (optimistic)
        alert("❤️ Liked!");
      } catch (err) {
        console.error(err);
      }
    }

    lastTapRef.current = now;
  };

  /* ================= COMMENT ================= */
  const sendComment = async () => {
    if (!commentText.trim()) return;

    const img = images[activeIndex];

    try {
      const newComment = await fetchWithToken(
        `${API_BASE}/api/photos/${img.postId}/comment`,
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

  /* ================= NAVIGATION ================= */
  const next = () => {
    setActiveIndex((prev) =>
      prev < images.length - 1 ? prev + 1 : prev
    );
  };

  const prev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  return (
    <div className="space-y-6">

      {/* ================= PROFILE MEDIA ================= */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold">Profile Media</h2>

        <div className="flex gap-3 overflow-x-auto">
          {user.profilePic && (
            <img
              src={user.profilePic}
              className="w-28 h-28 rounded-xl object-cover"
            />
          )}

          {user.coverPhoto && (
            <img
              src={user.coverPhoto}
              className="w-28 h-28 rounded-xl object-cover"
            />
          )}
        </div>
      </div>

      {/* ================= GRID ================= */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Photos</h2>

        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              onClick={() => openImage(i)}
              className="h-32 w-full object-cover rounded-lg cursor-pointer"
            />
          ))}
        </div>
      </div>

      {/* ================= FULLSCREEN VIEWER ================= */}
      {activeIndex !== null && images[activeIndex] && (
        <div className="fixed inset-0 bg-black z-50 flex">

          {/* IMAGE AREA */}
          <div
            className="flex-1 flex items-center justify-center relative"
            onClick={() => handleDoubleTap(images[activeIndex])}
          >

            <img
              src={images[activeIndex].url}
              className="max-h-[90vh] object-contain"
            />

            {/* NAV */}
            <button
              onClick={prev}
              className="absolute left-3 text-white text-3xl"
            >
              ◀
            </button>

            <button
              onClick={next}
              className="absolute right-3 text-white text-3xl"
            >
              ▶
            </button>

            {/* CLOSE */}
            <button
              onClick={() => setActiveIndex(null)}
              className="absolute top-3 right-3 text-white text-2xl"
            >
              ✖
            </button>
          </div>

          {/* COMMENTS PANEL */}
          <div className="w-[360px] bg-white flex flex-col">

            <div className="p-3 border-b font-semibold">
              Comments
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">

              {comments.map((c, i) => (
                <div key={i} className="text-sm border-b pb-2">
                  <b>{c.user?.name}</b>
                  <p>{c.text}</p>
                </div>
              ))}

            </div>

            {/* INPUT */}
            <div className="p-3 flex gap-2 border-t">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 border p-2 rounded"
                placeholder="Write comment..."
              />
              <button onClick={sendComment}>
                Send
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default PhotosSection;