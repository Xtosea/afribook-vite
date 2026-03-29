// src/components/PostCard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const reactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const PostCard = ({ post, currentUserId, onLike, onComment, onShare, setVideoRefs }) => {
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const videoRefs = useRef([]);

  useEffect(() => {
    if (setVideoRefs) {
      setVideoRefs(prev => [...prev, ...videoRefs.current.filter(Boolean)]);
    }
  }, [setVideoRefs]);

  const renderMedia = () => {
    if (!post.media?.length) return null;

    if (post.media.length === 1) {
      const m = post.media[0];
      const isPortrait = m.height > m.width;

      return (
        <div className={`rounded-xl overflow-hidden w-full cursor-pointer ${isPortrait ? "h-[600px]" : "h-[300px]"}`} onClick={() => navigate(`/media/${post._id}?index=0`)}>
          {m.type === "image" ? (
            <img src={m.url} className="w-full h-full object-contain bg-black" alt="" />
          ) : (
            <video data-src={m.url} ref={el => (videoRefs.current[0] = el)} className="w-full h-full object-cover bg-black" muted controls />
          )}
        </div>
      );
    }

    // MULTI-MEDIA GRID
    return (
      <div className="grid gap-2">
        {post.media.map((m, i) => {
          const isPortrait = m.height > m.width;

          // Determine grid layout
          let gridClass = "col-span-1 row-span-1";
          if (post.media.length === 2) gridClass = "col-span-1";
          if (post.media.length === 3 && i === 0) gridClass = "col-span-2 row-span-2";
          if (post.media.length >= 4 && i === 0) gridClass = "col-span-2 row-span-2";

          return (
            <div key={i} className={`rounded-xl overflow-hidden cursor-pointer ${gridClass}`} style={{ aspectRatio: isPortrait ? "3/4" : "9/12" }} onClick={() => navigate(`/media/${post._id}?index=${i}`)}>
              {m.type === "image" ? (
                <img src={m.url} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" alt="" />
              ) : (
                <video data-src={m.url} ref={el => (videoRefs.current[i] = el)} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" muted controls />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow space-y-3 w-full p-4">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <img src={post.user.profilePic || "/default-avatar.png"} alt={post.user.name} className="w-12 h-12 rounded-full object-cover" />
        <div className="flex-1">
          <p className="font-semibold">{post.user.name}</p>
          <div className="text-xs text-gray-500 flex gap-2 flex-wrap">
            <span>{new Date(post.createdAt).toLocaleString()}</span>
            {post.feeling && <span>• feeling {post.feeling}</span>}
            {post.location && <span>• {post.location}</span>}
          </div>
          {post.taggedFriends?.length > 0 && <div className="text-xs text-blue-500">with {post.taggedFriends.map(f => f.name).join(", ")}</div>}
        </div>
      </div>

      {/* CONTENT */}
      {post.content && <p>{post.content}</p>}

      {/* MEDIA */}
      {renderMedia()}

      {/* COUNTS */}
      <div className="text-sm text-gray-500 flex justify-between">
        <span>{post.reactions?.length || post.likes?.length || 0} reactions</span>
        <span>{post.comments?.length || 0} comments</span>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-between border-t pt-2">
        <div className="relative" onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
          <button onClick={() => onLike(post._id, "👍")} className="text-gray-600">👍 Like</button>
          {showReactions && (
            <div className="absolute bottom-8 left-0 bg-white shadow rounded-full px-2 py-1 flex gap-2 z-10">
              {reactions.map(r => (
                <button key={r} className="text-lg hover:scale-125" onClick={() => onLike(post._id, r)}>{r}</button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setShowComments(!showComments)}>💬 Comment</button>
        <button onClick={() => onShare(post)}>🔗 Share</button>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="space-y-2">
          {post.comments?.map(c => (
            <div key={c._id} className="flex gap-2">
              <img src={c.user.profilePic || "/default-avatar.png"} className="w-6 h-6 rounded-full" />
              <div>
                <span className="font-semibold text-sm">{c.user.name}</span>
                <p className="text-sm">{c.text}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <input value={commentText} onChange={e => setCommentText(e.target.value)} className="flex-1 border rounded px-2 py-1" placeholder="Write comment..." />
            <button onClick={() => { if (commentText.trim()) { onComment(post._id, commentText); setCommentText(""); }}} className="bg-blue-500 text-white px-3 rounded">Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;