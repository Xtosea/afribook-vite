// src/components/PostCard.jsx
import React, { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, fetchWithToken } from "../api/api";

const PostCard = ({ post, currentUserId }) => {
  const navigate = useNavigate();
  const videoRefs = useRef([]);
  const [fullscreen, setFullscreen] = useState(null);

  const media = post.media || [];
  const isMulti = media.length > 1;

  // Social states
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [shares, setShares] = useState(post.shares || 0);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);

  const likedByUser = likes.includes(currentUserId);

  // =========================
  // Like
  // =========================
  const handleLike = async () => {
    if (liking) return;
    setLiking(true);

    try {
      const res = await fetchWithToken(
        `${API_BASE}/api/posts/${post._id}/like`,
        localStorage.getItem("token"),
        { method: "POST" }
      );

      if (res?.likes) setLikes(res.likes);
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setLiking(false);
    }
  };

  // =========================
  // Comment
  // =========================
  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await fetchWithToken(
        `${API_BASE}/api/posts/${post._id}/comment`,
        localStorage.getItem("token"),
        {
          method: "POST",
          body: JSON.stringify({ text: commentText }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res?.comments) setComments(res.comments);
      setCommentText("");
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  // =========================
  // Share
  // =========================
  const handleShare = async () => {
    try {
      const url = `https://africbook.globelynks.com/post/${post._id}`;
      const text = post.text || "Check this post on Africbook";

      if (navigator.share) {
        await navigator.share({
          title: post.user?.name || "Africbook Post",
          text,
          url,
        });
      } else {
        navigator.clipboard.writeText(url);
        alert("Link copied");
      }

      const res = await fetchWithToken(
        `${API_BASE}/api/posts/${post._id}/share`,
        localStorage.getItem("token"),
        { method: "POST" }
      );

      if (res?.shares !== undefined) setShares(res.shares);
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  // =========================
  // Navigate Profile
  // =========================
  const goToProfile = useCallback(() => {
    navigate(`/profile/${post.user?._id}`);
  }, [navigate, post.user]);

  // =========================
  // Play video inline
  // =========================
  const handleVideoClick = (m, index) => {
    if (m.type === "video") {
      const vid = videoRefs.current[index];
      if (vid) {
        if (vid.paused) vid.play();
        else vid.pause();
      }
    } else {
      setFullscreen({ media: m });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-3 space-y-3">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <img
          src={
            post.user?.profilePic ||
            `https://ui-avatars.com/api/?name=${post.user?.name || "User"}`
          }
          className="w-12 h-12 rounded-full cursor-pointer object-cover"
          onClick={goToProfile}
        />

        <div>
          <p
            className="font-semibold cursor-pointer hover:underline"
            onClick={goToProfile}
          >
            {post.user?.name || "User"}
          </p>

          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* TEXT */}
      {post.text && <p className="text-gray-800 whitespace-pre-wrap">{post.text}</p>}

      {/* MEDIA */}
      <div className="grid grid-cols-1 gap-2">
        {media.map((m, i) => {
          const isVideo = m.type === "video";
          const classes = isMulti ? "h-48 w-full object-cover rounded-xl cursor-pointer" : "w-full rounded-xl cursor-pointer";

          return isVideo ? (
            <video
              key={i}
              ref={(el) => (videoRefs.current[i] = el)}
              src={m.url}
              muted
              controls
              className={classes}
              onClick={() => handleVideoClick(m, i)}
            />
          ) : (
            <img
              key={i}
              src={m.url}
              alt=""
              className={classes}
              onClick={() => handleVideoClick(m, i)}
            />
          );
        })}
      </div>

      {/* FULLSCREEN */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={() => setFullscreen(null)}
          >
            ×
          </button>

          {fullscreen.media?.type === "video" ? (
            <video
              src={fullscreen.media.url}
              controls
              autoPlay
              className="max-h-full max-w-full"
            />
          ) : (
            <img
              src={fullscreen.media.url}
              alt=""
              className="max-h-full max-w-full"
            />
          )}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-between text-sm pt-2 border-t">
        <button onClick={handleLike} className={`flex gap-1 ${likedByUser ? "text-blue-600 font-semibold" : ""}`}>
          👍 {likes.length}
        </button>

        <button onClick={() => setShowComments(!showComments)}>
          💬 {comments.length}
        </button>

        <button onClick={handleShare}>
          🔗 Share ({shares})
        </button>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="space-y-2">
          {comments.map((c, i) => (
            <div key={i} className="text-sm bg-gray-100 p-2 rounded">
              <b>{c.user?.name}</b> {c.text}
            </div>
          ))}

          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write comment..."
              className="flex-1 border rounded-lg p-2"
            />
            <button onClick={handleComment} className="bg-blue-600 text-white px-4 rounded-lg">
              Send
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default React.memo(PostCard);