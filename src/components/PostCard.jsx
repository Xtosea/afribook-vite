import React, { useState } from "react";

const reactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const PostCard = ({ post, currentUserId, onLike, onComment, onShare }) => {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [modalIndex, setModalIndex] = useState(null);
  const [showReactions, setShowReactions] = useState(false);

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

            {post.feeling && (
              <span>• feeling {post.feeling}</span>
            )}

            {post.location && (
              <span>• {post.location}</span>
            )}
          </div>

          {/* Tagged friends */}
          {post.taggedFriends?.length > 0 && (
            <div className="text-xs text-blue-500">
              with {post.taggedFriends.map(f => f.name).join(", ")}
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      {post.content && <p>{post.content}</p>}


      {/* MEDIA */}
      {post.media?.length > 0 && (
        <div className="space-y-2">
          {/* Big first */}
          <div>
            {post.media[0].type === "image" ? (
              <img
                src={post.media[0].url}
                className="w-full h-[400px] object-cover rounded-lg cursor-pointer"
                onClick={() => setModalIndex(0)}
                alt=""
              />
            ) : (
              <video
                src={post.media[0].url}
                className="w-full h-[400px] object-cover rounded-lg"
                controls
                muted
                onClick={() => setModalIndex(0)}
              />
            )}
          </div>

          {/* Small thumbnails */}
          {post.media.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
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
                      src={m.url}
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


      {/* REACTIONS COUNT */}
      <div className="text-sm text-gray-500 flex justify-between">
        <span>
          {post.reactions?.length || post.likes?.length || 0} reactions
        </span>
        <span>
          {post.comments?.length || 0} comments
        </span>
      </div>


      {/* ACTION BUTTONS */}
      <div className="flex justify-between border-t pt-2">

        {/* LIKE */}
        <div
          className="relative"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          <button
            onClick={() => onLike(post._id, "👍")}
            className="text-gray-600"
          >
            👍 Like
          </button>

          {showReactions && (
            <div className="absolute bottom-8 bg-white shadow rounded-full px-2 py-1 flex gap-2">
              {reactions.map((r) => (
                <button
                  key={r}
                  className="text-lg hover:scale-125"
                  onClick={() => onLike(post._id, r)}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* COMMENT */}
        <button onClick={() => setShowComments(!showComments)}>
          💬 Comment
        </button>

        {/* SHARE */}
        <button onClick={() => onShare(post)}>
          🔗 Share
        </button>
      </div>


      {/* COMMENTS */}
      {showComments && (
        <div className="space-y-2">
          {post.comments?.map((c) => (
            <div key={c._id} className="flex gap-2">
              <img
                src={c.user.profilePic || "/default-avatar.png"}
                className="w-6 h-6 rounded-full"
              />
              <div>
                <span className="font-semibold text-sm">
                  {c.user.name}
                </span>
                <p className="text-sm">{c.text}</p>
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 border rounded px-2 py-1"
              placeholder="Write comment..."
            />

            <button
              onClick={() => {
                onComment(post._id, commentText);
                setCommentText("");
              }}
              className="bg-blue-500 text-white px-3 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}


      {/* MODAL */}
      {modalIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div className="max-w-4xl w-full p-4">
            {post.media[modalIndex].type === "image" ? (
              <img
                src={post.media[modalIndex].url}
                className="w-full max-h-[80vh] object-contain"
              />
            ) : (
              <video
                src={post.media[modalIndex].url}
                className="w-full max-h-[80vh]"
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