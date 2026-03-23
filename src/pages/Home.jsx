// src/pages/Home.jsx
import React, { useEffect, useRef, useState } from "react";
import PostCard from "../components/PostCard";
import MediaUpload from "../components/MediaUpload";
import { API_BASE, fetchWithToken } from "../api/api";
import { socket } from "../socket";
import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";
import EmojiPicker from "emoji-picker-react";
import { FiUpload } from "react-icons/fi";

/* ================= LAZY VIDEO ================= */
const useLazyVideo = (ref) => {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            if (!video.src) video.src = video.dataset.src;
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    const observeVideos = () => {
      const videos = ref.current.querySelectorAll("video");
      videos.forEach((v) => observer.observe(v));
    };

    observeVideos();

    const mutationObserver = new MutationObserver(observeVideos);
    mutationObserver.observe(ref.current, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [ref]);
};

/* ================= SKELETON ================= */
const SkeletonPost = () => (
  <div className="bg-white p-4 rounded shadow animate-pulse space-y-3">
    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
    <div className="h-64 bg-gray-300 rounded"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
  </div>
);

const Home = () => {
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [newPost, setNewPost] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [location, setLocation] = useState("");
  const [feeling, setFeeling] = useState("");
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const feedRef = useRef();
  const observerRef = useRef();
  const fileInputRef = useRef();

  const { uploadImage } = useCloudinaryUpload();
  const { uploadVideo } = useR2Upload();

  useLazyVideo(feedRef);

  /* ================= CACHE ================= */
  useEffect(() => {
    const cached = localStorage.getItem("feed_posts");
    if (cached) {
      setPosts(JSON.parse(cached));
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    if (posts.length > 0) localStorage.setItem("feed_posts", JSON.stringify(posts));
  }, [posts]);

  /* ================= FETCH POSTS ================= */
  const fetchPosts = async (pageNum = 1) => {
    if (!token) return;
    try {
      pageNum === 1 ? setLoadingPosts(true) : setLoadingMore(true);

      const data = await fetchWithToken(`${API_BASE}/api/posts?limit=10&page=${pageNum}`, token);

      const fixedPosts = data.map((post) => ({
        ...post,
        media: post.media?.map((m) => ({
          ...m,
          url: m.url.startsWith("http") ? m.url : `${API_BASE}${m.url}`,
        })),
        user: {
          ...post.user,
          profilePic: post.user?.profilePic
            ? post.user.profilePic.startsWith("http")
              ? post.user.profilePic
              : `${API_BASE}${post.user.profilePic}`
            : `${API_BASE}/uploads/profiles/default-profile.png`,
        },
        likes: post.likes || [],
        comments: post.comments || [],
      }));

      if (pageNum === 1) setPosts(fixedPosts);
      else setPosts((prev) => [...prev, ...fixedPosts]);

      if (data.length < 10) setHasMore(false);
    } catch (err) {
      console.error("FETCH POSTS ERROR:", err);
    } finally {
      setLoadingPosts(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => fetchPosts(1), []);

  /* ================= INFINITE SCROLL ================= */
  const lastPostRef = (node) => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage);
      }
    });

    if (node) observerRef.current.observe(node);
  };

  /* ================= CREATE POST ================= */
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + mediaFiles.length > 5) {
      alert("Max 5 media files allowed");
      return;
    }
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMedia = (index) => setMediaFiles(prev => prev.filter((_, i) => i !== index));

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (posting || (!newPost.trim() && mediaFiles.length === 0)) return;

    setPosting(true);
    setUploadProgress(0);

    try {
      const uploadedMedia = [];

      for (const file of mediaFiles) {
        let url = null;
        if (file.type.startsWith("image")) {
          url = await uploadImage(file, (p) => setUploadProgress(p));
        } else if (file.type.startsWith("video")) {
          url = await uploadVideo(file, (p) => setUploadProgress(p));
        }
        if (url) uploadedMedia.push({ url, type: file.type.startsWith("image") ? "image" : "video" });
      }

      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          content: newPost,
          media: uploadedMedia,
          feeling,
          location,
          taggedFriends,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPosts((prev) => [data.post, ...prev]);
      setNewPost(""); setMediaFiles([]); setFeeling(""); setLocation(""); setTaggedFriends([]);
      setExpanded(false); setUploadProgress(0);
      fileInputRef.current.value = null;

      socket.emit("new-video", data.post);
    } catch (err) {
      console.error("POST ERROR:", err);
      alert("Upload failed");
    } finally {
      setPosting(false);
    }
  };

  /* ================= SOCKET.IO REAL-TIME ================= */
  useEffect(() => {
    socket.on("new-video", (newPost) => setPosts((prev) => [newPost, ...prev]));
    socket.on("new-video-comment", ({ videoId, comment }) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === videoId ? { ...p, comments: [...p.comments, comment] } : p))
      );
    });
    socket.on("video-liked", ({ videoId, userId }) => {
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === videoId) {
            const likes = p.likes.includes(userId)
              ? p.likes.filter((id) => id !== userId)
              : [...p.likes, userId];
            return { ...p, likes };
          }
          return p;
        })
      );
    });

    return () => {
      socket.off("new-video");
      socket.off("new-video-comment");
      socket.off("video-liked");
    };
  }, []);

  /* ================= POST INTERACTIONS ================= */
  const handleLike = async (postId) => {
    try {
      await fetchWithToken(`${API_BASE}/api/posts/${postId}/like`, token, { method: "PUT" });
      socket.emit("like-video", { videoId: postId, userId: currentUserId });
    } catch (err) { console.error("LIKE ERROR:", err); }
  };

  const handleComment = async (postId, text) => {
    try {
      const { comment } = await fetchWithToken(`${API_BASE}/api/posts/${postId}/comment`, token, {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" },
      });
      socket.emit("comment-video", { videoId: postId, comment });
    } catch (err) { console.error("COMMENT ERROR:", err); }
  };

  const handleShare = (post) => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post._id}`);
    alert("Post link copied!");
  };

  /* ================= RENDER ================= */
  return (
    <div className="container mx-auto py-6 max-w-2xl space-y-6">

      {/* CREATE POST */}
      <form onSubmit={handleSubmitPost} className="bg-white p-4 rounded-xl shadow space-y-3">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="What's on your mind?"
          className="w-full border rounded-lg p-3 resize-none"
          rows={expanded ? 4 : 2}
        />

        {expanded && (
          <>
            {showEmoji && (
              <EmojiPicker
                onEmojiClick={(e) => { setNewPost(prev => prev + e.emoji); setShowEmoji(false); }}
              />
            )}

            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-1 cursor-pointer px-3 py-1 border rounded-full text-sm">
                <FiUpload /> Media
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowEmoji(prev => !prev)}
                className="px-3 py-1 border rounded-full text-sm"
              >😊 Emoji</button>

              <input type="text" placeholder="Feeling" value={feeling} onChange={(e)=>setFeeling(e.target.value)} className="px-3 py-1 border rounded-full text-sm"/>
              <input type="text" placeholder="Location" value={location} onChange={(e)=>setLocation(e.target.value)} className="px-3 py-1 border rounded-full text-sm"/>
            </div>

            <input type="text" placeholder="Tag friends" value={taggedFriends.join(", ")} onChange={(e)=>setTaggedFriends(e.target.value.split(",").map(f=>f.trim()))} className="border rounded-lg px-3 py-2 w-full text-sm"/>

            {mediaFiles.length > 0 && (
              <div className="flex gap-3 overflow-x-auto">
                {mediaFiles.map((file, i) => (
                  <div key={i} className="relative">
                    <button type="button" onClick={()=>removeMedia(i)} className="absolute top-0 right-0 bg-black text-white rounded-full px-2 text-xs">✕</button>
                    {file.type.startsWith("image") ? (
                      <img src={URL.createObjectURL(file)} className="w-24 h-24 rounded object-contain bg-gray-100"/>
                    ) : (
                      <video src={URL.createObjectURL(file)} className="w-24 h-24 rounded object-contain bg-gray-100" controls/>
                    )}
                  </div>
                ))}
              </div>
            )}

            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 h-2 rounded">
                <div className="bg-blue-500 h-2 rounded" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}

            <button type="submit" disabled={posting} className="px-6 py-2 bg-blue-600 text-white rounded-full">
              {posting ? "Posting..." : "Post"}
            </button>
          </>
        )}
      </form>

      {/* POSTS FEED */}
      <div ref={feedRef} className="space-y-6">
        {loadingPosts ? (
          <>
            <SkeletonPost />
            <SkeletonPost />
            <SkeletonPost />
          </>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts yet</p>
        ) : (
          posts.map((post, idx) => (
            <div key={post._id} ref={idx === posts.length - 1 ? lastPostRef : null} className="bg-white rounded shadow overflow-hidden space-y-3">
              {post.media?.map((m, i) => (
                <div key={i}>
                  {m.type === "image" ? (
                    <img src={m.url} className="w-full h-64 object-cover" loading="lazy"/>
                  ) : (
                    <video data-src={m.url} className="w-full h-64 object-cover" muted playsInline preload="none" controls/>
                  )}
                </div>
              ))}
              <PostCard
                post={post}
                currentUserId={currentUserId}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
              />
            </div>
          ))
        )}
        {loadingMore && <p className="text-center text-gray-400">Loading more...</p>}
      </div>

    </div>
  );
};

export default Home;