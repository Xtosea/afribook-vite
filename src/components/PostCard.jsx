// src/components/PostCard.jsx
import React, { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, fetchWithToken } from "../api/api";

const PostCard = ({ post, currentUserId, feedRef }) => {
  const navigate = useNavigate();
  const videoRefs = useRef([]);
  const [fullscreen, setFullscreen] = useState(null);

  const media = post.media || [];
  const isMulti = media.length > 1;

  // --- Like / Comment / Share state ---
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [shares, setShares] = useState(post.shares || 0);
  const [commentText, setCommentText] = useState("");

  const likedByUser = likes.includes(currentUserId);

  // --- Handlers ---
  const handleLike = async () => {
    try {
      const res = await fetchWithToken(
        `${API_BASE}/api/posts/${post._id}/like`,
        localStorage.getItem("token"),
        { method: "POST" }
      );
      setLikes(res.likes);
    } catch (err) {
      console.error("Like error:", err);
    }
  };

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
      setComments(res.comments);
      setCommentText("");
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const handleShare = async (platform) => {
    try {
      const url = `${window.location.origin}/post/${post._id}`;
      let shareUrl = "";

      switch (platform) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          break;
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.text || "")}`;
          break;
        case "whatsapp":
          shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`;
          break;
        default:
          return;
      }
      window.open(shareUrl, "_blank");

      // Increment share count in backend
      const res = await fetchWithToken(
        `${API_BASE}/api/posts/${post._id}/share`,
        localStorage.getItem("token"),
        { method: "POST" }
      );
      setShares(res.shares);
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  // Memoized navigation to profile
  const goToProfile = useCallback(() => {
    navigate(`/profile/${post.user?._id}`);
  }, [navigate, post.user]);

  return (
    <div className="bg-white rounded-xl shadow space-y-3 p-2">

      {/* Birthday post */}
      {post.type === "birthday" && (
        <div className="bg-pink-100 text-pink-700 p-2 rounded-lg text-sm">
          🎂 Birthday
        </div>
      )}

      {/* ======================= */}
      {/* HEADER */}
      {/* ======================= */}
      <div className="flex items-center gap-3">
        <img
          src={
            post.user?.profilePic ||
            post.user?.profilePicture ||
            `https://ui-avatars.com/api/?name=${post.user?.name || "User"}`
          }
          alt=""
          className="w-16 h-16 rounded-full object-cover cursor-pointer"
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

      {/* ======================= */}
      {/* TEXT */}
      {/* ======================= */}
      {post.text && (
        <p className="text-gray-800 whitespace-pre-wrap">{post.text}</p>
      )}

      {/* ======================= */}
      {/* MEDIA */}
      {/* ======================= */}
      {!isMulti &&
        media.map((m, i) => {
          const isVideo = m.type === "video" || m.url?.endsWith(".mp4");
          const isPortrait = m.height > m.width;

          const commonProps = {
            key: i,
            className: `w-full rounded-xl overflow-hidden shadow cursor-pointer ${
              isPortrait ? "max-w-[500px] mx-auto" : ""
            }`,
            onClick: () => setFullscreen({ media: m }),
          };

          if (isVideo)
            return (
              <div {...commonProps}>
                <video
                  ref={(el) => (videoRefs.current[i] = el)}
                  src={m.url}
                  className={`w-full object-cover ${isPortrait ? "max-h-[700px]" : "max-h-[500px]"}`}
                  muted
                  controls
                />
              </div>
            );
          return (
            <div {...commonProps}>
              <img
                src={m.url}
                alt=""
                className={`w-full object-cover ${isPortrait ? "max-h-[500px]" : "max-h-[500px]"}`}
              />
            </div>
          );
        })}

      {isMulti && (
        <div className="grid grid-cols-2 gap-2">
          {media.map((m, i) => {
            const isVideo = m.type === "video" || m.url?.endsWith(".mp4");
            return (
              <div
                key={i}
                className="relative rounded-xl overflow-hidden cursor-pointer"
                onClick={() => setFullscreen({ media, index: i })}
              >
                {isVideo ? (
                  <video src={m.url} className="w-full h-[200px] object-cover" muted />
                ) : (
                  <img src={m.url} alt="" className="w-full h-[200px] object-cover" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ======================= */}
      {/* FULLSCREEN VIEWER */}
      {/* ======================= */}
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
              className="max-h-full max-w-full"
              controls
              autoPlay
            />
          ) : (
            <img src={fullscreen.media.url} alt="" className="max-h-full max-w-full" />
          )}
        </div>
      )}

      {/* ======================= */}
      {/* ACTIONS */}
      {/* ======================= */}
      <div className="flex justify-between items-center text-sm text-gray-600 pt-2">

        {/* Like */}
        <button
          className={`hover:text-blue-600 ${likedByUser ? "font-bold text-blue-600" : ""}`}
          onClick={handleLike}
        >
          👍 Like ({likes.length})
        </button>

        {/* Comment */}
        <div className="flex items-center gap-2">
          <button className="hover:text-blue-600">{comments.length} Comment</button>
        </div>

        {/* Share */}
        <div className="flex items-center gap-1">
          <button className="hover:text-blue-600" onClick={() => handleShare("facebook")}>Facebook</button>
          <button className="hover:text-blue-600" onClick={() => handleShare("twitter")}>Twitter</button>
          <button className="hover:text-blue-600" onClick={() => handleShare("whatsapp")}>WhatsApp</button>
          <span className="ml-2">({shares})</span>
        </div>
      </div>

      {/* ======================= */}
      {/* COMMENT INPUT */}
      {/* ======================= */}
      <div className="pt-2">
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="w-full border rounded-lg p-2 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleComment()}
        />
      </div>
    </div>
  );
};

export default React.memo(PostCard);