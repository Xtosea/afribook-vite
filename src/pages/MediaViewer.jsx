// src/pages/MediaViewer.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../api/api";

const reactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const MediaViewer = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [showReactions, setShowReactions] = useState(false);

  const videoRefs = useRef([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/posts/${postId}`);
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error("Failed to fetch post:", err);
      }
    };
    fetchPost();
  }, [postId]);

  const handleLike = (emoji) => {
    // Replace with your onLike logic
    console.log("Like:", postId, emoji);
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    // Replace with your onComment logic
    console.log("Comment:", postId, commentText);
    setCommentText("");
  };

  const handleShare = () => {
    // Replace with your onShare logic
    console.log("Share:", postId);
  };

  if (!post) return <p className="text-center mt-20">Loading...</p>;
  if (!post.media || post.media.length === 0) return <p>No media found.</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <img
          src={post.user.profilePic || "/default-avatar.png"}
          className="w-12 h-12 rounded-full object-cover"
          alt={post.user.name}
        />
        <div className="flex-1">
          <p className="font-semibold">{post.user.name}</p>
          <div className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      {/* MEDIA SCROLLER */}
      <div className="flex gap-2 overflow-x-scroll snap-x snap-mandatory">
        {post.media.map((m, i) => (
          <div
            key={i}
            className="snap-start flex-shrink-0 w-full max-w-[600px] rounded-xl overflow-hidden cursor-pointer"
            onClick={() => setActiveIndex(i)}
          >
            {m.type === "image" ? (
              <img
                src={m.url}
                className="w-full h-[70vh] object-contain rounded-xl bg-black"
                alt=""
              />
            ) : (
              <video
                ref={(el) => (videoRefs.current[i] = el)}
                src={m.url}
                className="w-full h-[70vh] object-contain rounded-xl bg-black"
                controls
                muted
              />
            )}
          </div>
        ))}
      </div>

      {/* REACTIONS */}
      <div className="flex items-center gap-2">
        <div
          className="relative"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          <button
            onClick={() => handleLike("👍")}
            className="text-gray-600"
          >
            👍 Like
          </button>
          {showReactions && (
            <div className="absolute bottom-8 left-0 bg-white shadow rounded-full px-2 py-1 flex gap-2 z-10">
              {reactions.map((r) => (
                <button
                  key={r}
                  className="text-lg hover:scale-125 transition-transform"
                  onClick={() => handleLike(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleComment}>💬 Comment</button>
        <button onClick={handleShare}>🔗 Share</button>
      </div>

      {/* COMMENTS */}
      <div className="space-y-2">
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
            onClick={handleComment}
            className="bg-blue-500 text-white px-3 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;