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

export default PostCard;