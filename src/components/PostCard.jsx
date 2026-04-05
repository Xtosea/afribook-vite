import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, fetchWithToken } from "../api/api";

const defaultCover =
  "https://afribook-backend.onrender.com/uploads/profiles/default-cover.png";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";
const PostCard = ({ post, currentUserId }) => {
  const navigate = useNavigate();
  const videoRefs = useRef([]);
  const [fullscreen, setFullscreen] = useState(null);

  // SAFE DATA
  const media = Array.isArray(post?.media) ? post.media : [];
  const isMulti = media.length > 1;

  // Social states
  const [likes, setLikes] = useState(Array.isArray(post?.likes) ? post.likes : []);
  const [comments, setComments] = useState(Array.isArray(post?.comments) ? post.comments : []);
  const [shares, setShares] = useState(post?.shares || 0);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);

  const likedByUser = likes.includes(currentUserId);

  /* ================= LIKE ================= */
  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await fetchWithToken(
        `${API_BASE}/api/posts/${post?._id}/like`,
        localStorage.getItem("token"),
        { method: "POST" }
      );
      if (res?.likesCount !== undefined) {
        setLikes(prev =>
          likedByUser
            ? prev.filter(id => id !== currentUserId)
            : [...prev, currentUserId]
        );
      }
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setLiking(false);
    }
  };

  /* ================= COMMENT ================= */
  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await fetchWithToken(
        `${API_BASE}/api/posts/${post?._id}/comment`,
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

  /* ================= SHARE ================= */
  const handleShare = async () => {
    try {
      const url = `https://africbook.globelynks.com/post/${post?._id}`;
      const text = post?.content || "Check this post on Africbook";
      if (navigator.share) {
        await navigator.share({ title: post?.user?.name || "Africbook Post", text, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied");
      }
      const res = await fetchWithToken(
        `${API_BASE}/api/posts/${post?._id}/share`,
        localStorage.getItem("token"),
        { method: "POST" }
      );
      if (res?.shares !== undefined) setShares(res.shares);
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  /* ================= NAVIGATE PROFILE ================= */
  const goToProfile = useCallback(() => {
    if (!post?.user?._id) return;
    navigate(`/profile/${post.user._id}`);
  }, [navigate, post]);

  /* ================= VIDEO AUTOPLAY ================= */
  useEffect(() => {
    if (!videoRefs.current.length) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 } // video plays when 50% visible
    );

    videoRefs.current.forEach(video => video && observer.observe(video));

    return () => {
      videoRefs.current.forEach(video => video && observer.unobserve(video));
    };
  }, [videoRefs, media]);

  return (
    <div className="bg-white rounded-xl shadow p-3 space-y-3">

      {/* HEADER */}
<div className="flex items-center gap-3">
  <img
    src={post?.user?.profilePic || defaultProfile}
    onError={(e) => {
      e.target.src = defaultProfile;
    }}
    className="w-16 h-16 rounded-full object-cover cursor-pointer"
    alt="profile"
    onClick={() => navigate(`/profile/${post.user?._id}`)}
  />
  <div>
    <p
      className="font-semibold cursor-pointer hover:underline"
      onClick={goToProfile}
    >
      {post?.user?.name || "User"}
    </p>
    <p className="text-xs text-gray-500">
      {post?.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
    </p>
  </div>
</div>

      {/* POST TEXT */}
      {post?.content && <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>}

      {/* MEDIA DISPLAY */}
      {media.length > 0 && (
        <div className={isMulti ? "grid grid-cols-2 gap-2" : ""}>
          {media.map((m, i) => {
            const isVideo = m?.type === "video";
            return isVideo ? (
              <video
                key={i}
                ref={el => (videoRefs.current[i] = el)}
                src={m?.url}
                controls
                muted
                className={isMulti ? "w-full h-48 object-cover rounded-xl cursor-pointer" : "w-full rounded-xl cursor-pointer"}
                onClick={() => setFullscreen({ media: m })}
              />
            ) : (
              <img
                key={i}
                src={m?.url}
                alt=""
                className={isMulti ? "w-full h-48 object-cover rounded-xl cursor-pointer" : "w-full rounded-xl cursor-pointer"}
                onClick={() => setFullscreen({ media: m })}
              />
            );
          })}
        </div>
      )}

      {/* FULLSCREEN VIEW */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={() => setFullscreen(null)}
          >
            ×
          </button>
          {fullscreen?.media?.type === "video" ? (
            <video src={fullscreen.media.url} controls autoPlay className="max-h-full max-w-full" />
          ) : (
            <img src={fullscreen.media.url} alt="" className="max-h-full max-w-full" />
          )}
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex justify-between text-sm pt-2 border-t">
        <button onClick={handleLike} className={`flex gap-1 ${likedByUser ? "text-blue-600 font-semibold" : ""}`}>
          👍 {likes.length}
        </button>
        <button onClick={() => setShowComments(!showComments)}>
          💬 {comments.length}
        </button>
        <button onClick={handleShare}>🔗 Share ({shares})</button>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="space-y-2">
          {comments.map((c, i) => (
            <div key={i} className="text-sm bg-gray-100 p-2 rounded">
              <b>{c?.user?.name || "User"}</b> {c?.text}
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
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