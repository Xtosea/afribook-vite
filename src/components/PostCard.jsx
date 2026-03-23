import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../api/api";
import { io as socketIOClient } from "socket.io-client";

const PostCard = ({ post, currentUserId, onLike, onComment, onShare, user: currentUser }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [likedAnimation, setLikedAnimation] = useState(false);
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [newActivity, setNewActivity] = useState(false);

  const videoRefs = useRef([]);
  const socketRef = useRef(null);

  const likedByUser = likes.includes(currentUserId);

  const postUser = post.user || {
    _id: null,
    name: "Deleted User",
    profilePic: `${API_BASE}/uploads/profiles/default-profile.png`,
  };

  const user = {
    ...postUser,
    profilePic:
      currentUser?._id === postUser._id
        ? currentUser.profilePic || postUser.profilePic
        : postUser.profilePic,
  };

  /* ================= SOCKET.IO ================= */
  useEffect(() => {
    socketRef.current = socketIOClient(API_BASE, { transports: ["websocket"] });

    // Join room for post updates (post._id as room)
    socketRef.current.emit("join-post", post._id);

    socketRef.current.on("post-like", (data) => {
      if (data.postId === post._id) {
        setLikes((prev) => [...prev, data.userId]);
        setNewActivity(true);
        setTimeout(() => setNewActivity(false), 2000);
      }
    });

    socketRef.current.on("post-comment", (data) => {
      if (data.postId === post._id) {
        setComments((prev) => [...prev, data.comment]);
        setNewActivity(true);
        setTimeout(() => setNewActivity(false), 2000);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [post._id]);

  /* ================= COMMENT HANDLER ================= */
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onComment && onComment(post._id, commentText);
    setCommentText("");
  };

  /* ================= VIDEO LAZY LOAD ================= */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        });
      },
      { threshold: 0.5 }
    );

    videoRefs.current.forEach((v) => v && observer.observe(v));
    return () => videoRefs.current.forEach((v) => v && observer.unobserve(v));
  }, [post.media]);

  /* ================= TAP TO LIKE ================= */
  const handleVideoTapLike = (postId) => {
    onLike && onLike(postId);
    setLikedAnimation(true);
    setTimeout(() => setLikedAnimation(false), 800);
  };

  const transformImage = (url, width = 600, height = 600) => {
    if (!url.includes("res.cloudinary.com")) return url;
    return url.replace("/upload/", `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3 relative">

      {/* NEW ACTIVITY BADGE */}
      {newActivity && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded animate-pulse">
          New Activity
        </div>
      )}

      {/* USER INFO */}
      <div className="flex items-center gap-3">
        <Link to={`/profile/${user._id}`}>
          <img
            src={user.profilePic}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
          />
        </Link>
        <Link to={`/profile/${user._id}`} className="font-semibold hover:underline">
          {user.name}
        </Link>
      </div>

      {/* CONTENT */}
      <div className="text-gray-700 space-y-1">
        <p>{post.content}</p>
        {post.feeling && <p className="text-gray-500 text-sm">Feeling {post.feeling}</p>}
        {post.location && <p className="text-gray-500 text-sm">📍 {post.location}</p>}
      </div>

      {/* MEDIA */}
      {post.media?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 relative">
          {post.media.map((m, i) =>
            m.type.startsWith("image") ? (
              <img
                key={i}
                src={transformImage(m.url)}
                alt={`media-${i}`}
                className="w-full h-48 object-cover rounded cursor-pointer hover:scale-105 transition-transform"
              />
            ) : (
              <div key={i} className="relative">
                <video
                  ref={(el) => (videoRefs.current[i] = el)}
                  src={m.url}
                  controls
                  preload="metadata"
                  className="w-full h-48 rounded object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleVideoTapLike(post._id)}
                />
                {likedAnimation && likedByUser && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-4xl animate-ping text-red-500">❤️</span>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex items-center gap-4 mt-2 text-sm">
        <button
          onClick={() => onLike && onLike(post._id)}
          className={`px-2 py-1 rounded ${likedByUser ? "bg-red-400 text-white" : "bg-gray-200"}`}
        >
          {likedByUser ? "❤️ Liked" : "🤍 Like"} ({likes.length})
        </button>

        <button onClick={() => setShowComments(!showComments)} className="px-2 py-1 bg-gray-200 rounded">
          💬 Comments ({comments.length})
        </button>

        <button onClick={() => onShare && onShare(post)} className="px-2 py-1 bg-gray-200 rounded">
          🔗 Share
        </button>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="mt-2 space-y-2">
          {comments.length === 0 ? (
            <p className="text-gray-400 text-sm">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="text-sm">
                <span className="font-semibold">{c.user?.name || "Deleted"}: </span>
                {c.text}
              </div>
            ))
          )}

          <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-1">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 border rounded px-2 py-1 text-sm"
            />
            <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;