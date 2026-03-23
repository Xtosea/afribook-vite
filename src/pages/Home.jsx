import React, { useEffect, useRef, useState } from "react";
import PostCard from "../components/PostCard";
import { API_BASE, fetchWithToken } from "../api/api";
import { socket } from "../socket";
import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";
import MediaUpload from "../components/MediaUpload";

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

    const videos = ref.current.querySelectorAll("video");
    videos.forEach((v) => observer.observe(v));

    return () => videos.forEach((v) => observer.unobserve(v));
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
  const [posting, setPosting] = useState(false);

  const feedRef = useRef();
  const fileInputRef = useRef();
  const observerRef = useRef();

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

  /* ================= MEDIA UPLOAD ================= */
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles((prev) => [...prev, ...files]);
  };

  /* ================= CREATE POST ================= */
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (posting || !newPost.trim()) return;

    setPosting(true);
    try {
      const uploadedMedia = [];

      for (const file of mediaFiles) {
        let url = null;
        if (file.type.startsWith("image")) url = await uploadImage(file);
        else if (file.type.startsWith("video")) url = await uploadVideo(file);

        if (url) uploadedMedia.push({ url, type: file.type.startsWith("image") ? "image" : "video" });
      }

      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPost, media: uploadedMedia }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPosts((prev) => [data.post, ...prev]);
      setNewPost("");
      setMediaFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = null;

      socket.emit("new-video", data.post);
    } catch (err) {
      console.error("POST ERROR:", err);
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
    } catch (err) {
      console.error("LIKE ERROR:", err);
    }
  };

  const handleComment = async (postId, text) => {
    try {
      const { comment } = await fetchWithToken(
        `${API_BASE}/api/posts/${postId}/comment`,
        token,
        { method: "POST", body: JSON.stringify({ text }), headers: { "Content-Type": "application/json" } }
      );
      socket.emit("comment-video", { videoId: postId, comment });
    } catch (err) {
      console.error("COMMENT ERROR:", err);
    }
  };

  const handleShare = (post) => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post._id}`);
    alert("Post link copied to clipboard!");
  };

  /* ================= RENDER ================= */
  return (
    <div className="container mx-auto py-6 max-w-2xl space-y-6">
      {/* CREATE POST */}
      <form onSubmit={handleSubmitPost} className="bg-white p-4 rounded shadow space-y-3">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border p-2 rounded"
        />
        <input ref={fileInputRef} type="file" multiple onChange={handleMediaChange} />
        <button type="submit" disabled={posting} className="bg-blue-500 text-white px-4 py-2 rounded">
          {posting ? "Posting..." : "Post"}
       
        
       // Inside the form:
<MediaUpload mediaFiles={mediaFiles} setMediaFiles={setMediaFiles} />

        
         </button>
  
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
            <div
              key={post._id}
              ref={idx === posts.length - 1 ? lastPostRef : null}
              className="bg-white rounded shadow overflow-hidden space-y-3"
            >
              {post.media?.map((m, i) => (
                <div key={i}>
                  {m.type === "image" ? (
                    <img src={m.url} className="w-full h-64 object-cover" loading="lazy" />
                  ) : (
                    <video
                      data-src={m.url}
                      className="w-full h-64 object-cover"
                      muted
                      playsInline
                      preload="none"
                      controls
                    />
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