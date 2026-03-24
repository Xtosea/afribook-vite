// src/components/PostCard.jsx
import React, { useState } from "react";

const PostCard = ({ post, currentUserId, onLike, onComment, onShare }) => {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <img
          src={post.user.profilePic || "/default-avatar.png"}
          alt={post.user.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">{post.user.name}</p>
          <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* CONTENT */}
      <p>{post.content}</p>

      {/* MEDIA */}
      {post.media?.length > 0 && (
        <div className="flex flex-col gap-2">
          {post.media.map((m, i) =>
            m.type === "image" ? (
              <img
                key={i}
                src={m.url}
                className="w-full max-h-[500px] object-cover rounded-lg"
                alt=""
              />
            ) : (
              <video
                key={i}
                data-src={m.url}
                className="w-full max-h-[500px] object-cover rounded-lg"
                controls
                muted
                preload="metadata"
              />
            )
          )}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-between mt-2 text-sm text-gray-500">
        <button onClick={() => onLike(post._id)}>
          👍 {post.likes?.length || 0}
        </button>
        <button onClick={() => setShowComments(!showComments)}>
          💬 {post.comments?.length || 0}
        </button>
        <button onClick={() => onShare(post)}>🔗 Share</button>
      </div>

      {/* COMMENT BOX */}
      {showComments && (
        <div className="mt-2 space-y-2">
          {post.comments?.map((c) => (
            <div key={c._id} className="flex items-center gap-2">
              <img
                src={c.user.profilePic || "/default-avatar.png"}
                alt={c.user.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <p className="text-sm">
                <span className="font-semibold">{c.user.name}</span> {c.text}
              </p>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 border rounded px-2 py-1"
              placeholder="Write a comment..."
            />
            <button
              className="bg-blue-500 text-white px-3 rounded"
              onClick={() => {
                onComment(post._id, commentText);
                setCommentText("");
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;      { threshold: 0.5 }
    );

    videoRefs.current.forEach((v) => v && observer.observe(v));
    return () => videoRefs.current.forEach((v) => v && observer.unobserve(v));
  }, [post.media]);

  const handleVideoTapLike = () => {
    onLike && onLike(post._id);
    setLikedAnimation(true);
    setTimeout(() => setLikedAnimation(false), 800);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onComment && onComment(post._id, commentText);
    setCommentText("");
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3 relative">

      {/* USER INFO */}
      <div className="flex items-center gap-3">
        <Link to={`/profile/${postUser._id}`}>
          <img
            src={postUser.profilePic}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
          />
        </Link>
        <Link to={`/profile/${postUser._id}`} className="font-semibold hover:underline">
          {postUser.name}
        </Link>
      </div>

      {/* POST CONTENT */}
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
                src={m.url}
                alt={`media-${i}`}
                className="w-full h-48 object-cover rounded cursor-pointer hover:scale-105 transition-transform"
              />
            ) : (
              <div key={i} className="relative">
                <video
                  ref={(el) => (videoRefs.current[i] = el)}
                  data-src={m.url}
                  className="w-full h-48 rounded object-cover cursor-pointer hover:scale-105 transition-transform"
                  muted
                  playsInline
                  preload="metadata"
                  controls
                  onClick={handleVideoTapLike}
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

      {/* ACTION BUTTONS */}
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

        <button
          onClick={() => onShare && onShare(post)}
          className="px-2 py-1 bg-gray-200 rounded"
        >
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
