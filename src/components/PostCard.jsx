// src/components/PostCard.jsx
import React, { useState, useEffect, useRef } from "react";

const reactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const PostCard = ({ post, currentUserId, onLike, onComment, onShare, setVideoRefs }) => {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [modalIndex, setModalIndex] = useState(null);
  const [showReactions, setShowReactions] = useState(false);

  const videoRefs = useRef([]);

  // Pass video refs up to parent for lazy-loading
  useEffect(() => {
    if (setVideoRefs) {
      setVideoRefs((prev) => [...prev, ...videoRefs.current.filter(Boolean)]);
    }
  }, [setVideoRefs]);

  const closeModal = () => setModalIndex(null);

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <img
          src={post.user.profilePic || "/default-avatar.png"}
          alt={post.user.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-semibold">{post.user.name}</p>
          <div className="text-xs text-gray-500 flex gap-2 flex-wrap">
            <span>{new Date(post.createdAt).toLocaleString()}</span>
            {post.feeling && <span>• feeling {post.feeling}</span>}
            {post.location && <span>• {post.location}</span>}
          </div>
          {post.taggedFriends?.length > 0 && (
            <div className="text-xs text-blue-500">
              with {post.taggedFriends.map((f) => f.name).join(", ")}
            </div>
          )}
        </div>
      </div>

      {/* MEDIA */}
      {post.media?.length > 0 && (
        <div className="space-y-2">
          {/* First media */}
          <div>
            {post.media[0].type === "image" ? (
              <img
                src={post.media[0].url}
                loading="lazy"
                className="w-full max-h-[70vh] object-contain rounded-lg bg-black cursor-pointer"
                onClick={() => setModalIndex(0)}
                alt=""
              />
            ) : (
              <video
                data-src={post.media[0].url}
                ref={(el) => (videoRefs.current[0] = el)}
                className="w-full max-h-[70vh] object-contain rounded-lg bg-black cursor-pointer"
                controls
                muted
                onClick={() => setModalIndex(0)}
              />
            )}
          </div>

          {/* Thumbnails */}
          {post.media.length > 1 && (
            <div className="flex gap-2 overflow-x-auto mt-2">
              {post.media.slice(1).map((m, i) => (
                <div key={i} onClick={() => setModalIndex(i + 1)}>
                  {m.type === "image" ? (
                    <img
                      src={m.url}
                      className="w-24 h-24 object-cover rounded cursor-pointer"
                      alt=""
                    />
                  ) : (
                    <video
                      data-src={m.url}
                      ref={(el) => (videoRefs.current[i + 1] = el)}
                      className="w-24 h-24 object-cover rounded"
                      muted
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REACTIONS & COMMENTS COUNT */}
      <div className="text-sm text-gray-500 flex justify-between">
        <span>{post.reactions?.length || post.likes?.length || 0} reactions</span>
        <span>{post.comments?.length || 0} comments</span>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-between border-t pt-2">
        {/* LIKE */}
        <div
          className="relative"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          <button onClick={() => onLike(post._id, "👍")} className="text-gray-600">
            👍 Like
          </button>
          {showReactions && (
            <div className="absolute bottom-8 left-0 bg-white shadow rounded-full px-2 py-1 flex gap-2 z-10">
              {reactions.map((r) => (
                <button
                  key={r}
                  className="text-lg hover:scale-125 transition-transform"
                  onClick={() => onLike(post._id, r)}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* COMMENT */}
        <button onClick={() => setShowComments(!showComments)}>💬 Comment</button>

        {/* SHARE */}
        <button onClick={() => onShare(post)}>🔗 Share</button>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="space-y-2 mt-2">
          {post.comments?.map((c) => (
            <div key={c._id} className="flex gap-2 items-start">
              <img
                src={c.user.profilePic || "/default-avatar.png"}
                className="w-6 h-6 rounded-full object-cover"
                alt={c.user.name}
              />
              <div>
                <span className="font-semibold text-sm">{c.user.name}</span>
                <p className="text-sm">{c.text}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 border rounded px-2 py-1"
              placeholder="Write comment..."
            />
            <button
              onClick={() => {
                if (commentText.trim()) {
                  onComment(post._id, commentText);
                  setCommentText("");
                }
              }}
              className="bg-blue-500 text-white px-3 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {modalIndex !== null && post.media[modalIndex] && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div className="max-w-4xl w-full p-4">
            {post.media[modalIndex].type === "image" ? (
              <img
                src={post.media[modalIndex].url}
                className="w-full max-h-[85vh] object-contain bg-black rounded-lg"
                alt=""
              />
            ) : (
              <video
                src={post.media[modalIndex].url}
                className="w-full max-h-[85vh] object-contain bg-black rounded-lg"
                controls
                autoPlay
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;