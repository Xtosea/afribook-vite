// src/components/PostCard.jsx
import React, { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, fetchWithToken } from "../api/api";

// Utility to generate video thumbnail
const generateVideoThumbnail = (videoUrl) =>
  new Promise((resolve) => {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.crossOrigin = "anonymous";
    video.currentTime = 1; // Capture frame at 1 second
    video.addEventListener("loadeddata", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth / 2;
      canvas.height = video.videoHeight / 2;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    });
  });

const PostCard = ({ post, currentUserId }) => {
  const navigate = useNavigate();
  const videoRefs = useRef([]);
  const [fullscreen, setFullscreen] = useState(null);

  const media = post.media || [];
  const isMulti = media.length > 1;

  // Social states
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [shares, setShares] = useState(post.shares || 0);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);

  const likedByUser = likes.includes(currentUserId);

  // Thumbnails for videos
  const [thumbnails, setThumbnails] = useState({});

  useEffect(() => {
    media.forEach((m) => {
      if (m.type === "video") {
        generateVideoThumbnail(m.url).then((dataUrl) => {
          setThumbnails((prev) => ({ ...prev, [m.url]: dataUrl }));
        });
      }
    });
  }, [media]);

  // =========================
  // Like
  // =========================
  const handleLike = async () => {
    if (liking) return;
    setLiking(true);

    try {
      const res = await fetchWithToken(
        `${API_BASE}/api/posts/${post._id}/like`,
        localStorage.getItem("token"),
        { method: "POST" }
      );
      if (res?.likes) setLikes(res.likes);
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setLiking(false);
    }
  };

  // =========================
  // Comment
  // =========================
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
      if (res?.comments) setComments(res.comments);
      setCommentText("");
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  // =========================
  // Share
  // =========================
  const handleShare = async () => {
    try {
      const url = `https://africbook.globelynks.com/post/${post._id}`;
      const text = post.text || "Check this post on Africbook";

      if (navigator.share) {
        await navigator.share({ title: post.user?.name || "Africbook Post", text, url });
      } else {
        navigator.clipboard.writeText(url);
        alert("Link copied");
      }

      const res = await fetchWithToken(
        `${API_BASE}/api/posts/${post._id}/share`,
        localStorage.getItem("token"),
        { method: "POST" }
      );
      if (res?.shares !== undefined) setShares(res.shares);
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  // =========================
  // Navigate Profile
  // =========================
  const goToProfile = useCallback(() => {
    navigate(`/profile/${post.user?._id}`);
  }, [navigate, post.user]);

  return (
    <div className="bg-white rounded-xl shadow p-3 space-y-3">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <img
          src={
            post.user?.profilePic ||
            `https://ui-avatars.com/api/?name=${post.user?.name || "User"}`
          }
          className="w-12 h-12 rounded-full cursor-pointer object-cover"
          onClick={goToProfile}
        />
        <div>
          <p className="font-semibold cursor-pointer hover:underline" onClick={goToProfile}>
            {post.user?.name || "User"}
          </p>
          <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* TEXT */}
      {post.text && <p className="text-gray-800 whitespace-pre-wrap">{post.text}</p>}

      {/* MEDIA */}
      {!isMulti &&
        media.map((m, i) => {
          const isVideo = m.type === "video";
          return isVideo ? (
            <div key={i} className="relative">
              {thumbnails[m.url] && !videoRefs.current[i]?.played && (
                <img
                  src={thumbnails[m.url]}
                  alt="thumbnail"
                  className="w-full rounded-xl cursor-pointer object-cover"
                  onClick={() => videoRefs.current[i]?.play()}
                />
              )}
              <video
                ref={(el) => (videoRefs.current[i] = el)}
                src={m.url}
                controls
                muted
                className="w-full rounded-xl cursor-pointer hidden"
                onClick={() => setFullscreen({ media: m })}
                onPlay={(e) => e.target.classList.remove("hidden")}
              />
            </div>
          ) : (
            <img
              key={i}
              src={m.url}
              alt=""
              className="w-full rounded-xl cursor-pointer"
              onClick={() => setFullscreen({ media: m })}
            />
          );
        })}

      {/* MULTI MEDIA */}
      {isMulti && (
        <div className="grid grid-cols-2 gap-2">
          {media.map((m, i) => {
            const isVideo = m.type === "video";
            return isVideo ? (
              <div key={i} className="relative">
                {thumbnails[m.url] && (
                  <img
                    src={thumbnails[m.url]}
                    alt="thumbnail"
                    className="w-full h-48 object-cover rounded-xl cursor-pointer"
                    onClick={() => videoRefs.current[i]?.play()}
                  />
                )}
                <video
                  ref={(el) => (videoRefs.current[i] = el)}
                  src={m.url}
                  className="w-full h-48 object-cover rounded-xl hidden"
                  muted
                  onClick={() => setFullscreen({ media: m })}
                  onPlay={(e) => e.target.classList.remove("hidden")}
                />
              </div>
            ) : (
              <img
                key={i}
                src={m.url}
                alt=""
                className="w-full h-48 object-cover rounded-xl cursor-pointer"
                onClick={() => setFullscreen({ media: m })}
              />
            );
          })}
        </div>
      )}

      {/* FULLSCREEN */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          <button className="absolute top-4 right-4 text-white text-3xl" onClick={() => setFullscreen(null)}>
            ×
          </button>
          {fullscreen.media?.type === "video" ? (
            <video src={fullscreen.media.url} controls autoPlay className="max-h-full max-w-full" />
          ) : (
            <img src={fullscreen.media.url} alt="" className="max-h-full max-w-full" />
          )}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-between text-sm pt-2 border-t">
        <button onClick={handleLike} className={`flex gap-1 ${likedByUser ? "text-blue-600 font-semibold" : ""}`}>
          👍 {likes.length}
        </button>
        <button onClick={() => setShowComments(!showComments)}>💬 {comments.length}</button>
        <button onClick={handleShare}>🔗 Share ({shares})</button>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="space-y-2">
          {comments.map((c, i) => (
            <div key={i} className="text-sm bg-gray-100 p-2 rounded">
              <b>{c.user?.name}</b> {c.text}
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
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