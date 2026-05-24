import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, fetchWithToken } from "../api/api";
import PostMenu from "./PostMenu";
import renderContentWithLinks from "../utils/renderContentWithLinks";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

const PostCard = ({
  post,
  currentUserId,
  onDeleted,
  onUpdated,
}) => {
  const navigate = useNavigate();
  const videoRefs = useRef([]);
  const observerRef = useRef(null);

  const [fullscreen, setFullscreen] = useState(null);

  const media = Array.isArray(post?.media) ? post.media : [];
  const isMulti = media.length > 1;

  const [likes, setLikes] = useState(Array.isArray(post?.likes) ? post.likes : []);
  const [comments, setComments] = useState(Array.isArray(post?.comments) ? post.comments : []);
  const [shares, setShares] = useState(post?.shares || 0);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);

  const token = localStorage.getItem("token");
  const likedByUser = likes.includes(currentUserId);

  /* ================= LIKE ================= */
  const handleLike = async () => {
    if (liking) return;
    setLiking(true);

    try {
      const res = await fetchWithToken(
        `${API_BASE}/api/posts/${post?._id}/like`,
        token,
        { method: "POST" }
      );

      if (res?.likes) {
        setLikes(res.likes);
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
        token,
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

  /* ================= SHARE (native) ================= */
  const handleShare = async () => {
    try {
      const url = `https://afribook-backend.onrender.com/post/${post?._id}`;
      const text = post?.content || "Check this post";

      if (navigator.share) {
        await navigator.share({
          title: post?.user?.name || "Post",
          text,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied");
      }

      const res = await fetchWithToken(
        `${API_BASE}/api/posts/${post?._id}/share`,
        token,
        { method: "POST" }
      );

      if (res?.shares !== undefined) {
        setShares(res.shares);
      }
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  /* ================= SHARE TO FEED (IMPORTANT FIXED) ================= */
  const shareToFeed = async () => {
    try {
      const res = await fetchWithToken(
        `${API_BASE}/api/posts/${post._id}/share-to-feed`,
        token,
        { method: "POST" }
      );

      if (res?.post) {
        onUpdated?.(res.post);
        alert("Shared to feed");
      }
    } catch (err) {
      console.error("Share to feed error:", err);
    }
  };

  /* ================= PROFILE NAV ================= */
  const goToProfile = useCallback(() => {
    if (!post?.user?._id) return;
    navigate(`/profile/${post.user._id}`);
  }, [navigate, post]);

  /* ================= VIDEO AUTOPLAY ================= */
  useEffect(() => {
    if (!media.length) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            videoRefs.current.forEach((v) => {
              if (v && v !== video) {
                v.pause();
                v.muted = true;
              }
            });

            video.muted = false;
            video.play().catch(() => {});
          } else {
            video.pause();
            video.muted = true;
          }
        });
      },
      { threshold: [0, 0.7, 1] }
    );

    videoRefs.current.forEach((v) => v && observerRef.current.observe(v));

    return () => {
      if (observerRef.current) {
        videoRefs.current.forEach((v) => {
          if (v) observerRef.current.unobserve(v);
        });
      }
    };
  }, [media]);

  return (
    <div className="bg-white rounded-xl shadow p-3 space-y-3">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <img
          src={post?.user?.profilePic || defaultProfile}
          onClick={goToProfile}
          className="w-14 h-14 rounded-full object-cover cursor-pointer"
          alt=""
        />

        <div>
          <p className="font-semibold cursor-pointer" onClick={goToProfile}>
            {post?.user?.name || "User"}
          </p>

          <p className="text-xs text-gray-500">
            {post?.createdAt
              ? new Date(post.createdAt).toLocaleString()
              : ""}
          </p>
        </div>
      </div>

      <PostMenu
        post={post}
        token={token}
        currentUser={{ _id: currentUserId }}
        onDeleted={onDeleted}
        onUpdated={onUpdated}
      />

      {/* TEXT */}
      {post?.content && (
        <div className="p-3 whitespace-pre-wrap break-words">
          {renderContentWithLinks(post.content)}
        </div>
      )}

      {/* MEDIA */}
      {media.length > 0 && (
        <div className={isMulti ? "grid grid-cols-2 gap-2" : ""}>
          {media.map((m, i) =>
            m.type === "video" ? (
              <video
                key={i}
                ref={(el) => (videoRefs.current[i] = el)}
                src={m.url}
                controls
                className="w-full rounded-lg"
              />
            ) : (
              <img
                key={i}
                src={m.url}
                className="w-full rounded-lg"
                alt=""
              />
            )
          )}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-between text-sm border-t pt-2">

        <button onClick={shareToFeed}>
          🔁 Share to Feed
        </button>

        <button onClick={handleLike}>
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
              <b>{c?.user?.name || "User"}</b> {c?.text}
            </div>
          ))}

          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 border p-2 rounded"
              placeholder="Write comment..."
            />

            <button
              onClick={handleComment}
              className="bg-blue-600 text-white px-4 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default React.memo(PostCard);