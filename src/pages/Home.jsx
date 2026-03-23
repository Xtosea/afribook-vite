// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from "react";
import PostCard from "../components/PostCard";
import { API_BASE, fetchWithToken } from "../api/api";
import { socket } from "../socket";

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
  const [posting, setPosting] = useState(false);

  const feedRef = useRef();
  const observerRef = useRef();

  /* ================= FETCH POSTS ================= */
  const fetchPosts = async (pageNum = 1) => {
    if (!token) return;
    pageNum === 1 ? setLoadingPosts(true) : setLoadingMore(true);

    try {
      const data = await fetchWithToken(`${API_BASE}/api/posts?limit=10&page=${pageNum}`, token);

      const fixedPosts = data.map(post => ({
        ...post,
        media: post.media?.map(m => ({
          ...m,
          url: m.url.startsWith("http") ? m.url : `${API_BASE}${m.url}`,
        })),
        likes: post.likes || [],
        comments: post.comments || [],
      }));

      pageNum === 1 ? setPosts(fixedPosts) : setPosts(prev => [...prev, ...fixedPosts]);
      if (data.length < 10) setHasMore(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => fetchPosts(1), []);

  /* ================= SOCKET.IO REAL-TIME ================= */
  useEffect(() => {
    socket.on("new-video", (post) => setPosts(prev => [post, ...prev]));
    socket.on("new-video-comment", ({ videoId, comment }) =>
      setPosts(prev => prev.map(p => p._id === videoId ? { ...p, comments: [...p.comments, comment] } : p))
    );
    socket.on("video-liked", ({ videoId, userId }) =>
      setPosts(prev => prev.map(p => {
        if (p._id === videoId) {
          const likes = p.likes.includes(userId) ? p.likes.filter(id => id !== userId) : [...p.likes, userId];
          return { ...p, likes };
        }
        return p;
      }))
    );

    return () => {
      socket.off("new-video");
      socket.off("new-video-comment");
      socket.off("video-liked");
    };
  }, []);

  /* ================= CREATE POST ================= */
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (posting || !newPost.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPost }),
      });
      const data = await res.json();
      setPosts(prev => [data.post, ...prev]);
      setNewPost("");
      socket.emit("new-video", data.post);
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  /* ================= LIKE & COMMENT ================= */
  const handleLike = async (postId) => {
    try {
      await fetchWithToken(`${API_BASE}/api/posts/${postId}/like`, token, { method: "PUT" });
      socket.emit("like-video", { videoId: postId, userId: currentUserId });
    } catch (err) { console.error(err); }
  };

  const handleComment = async (postId, text) => {
    try {
      const { comment } = await fetchWithToken(`${API_BASE}/api/posts/${postId}/comment`, token, {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" },
      });
      socket.emit("comment-video", { videoId: postId, comment });
    } catch (err) { console.error(err); }
  };

  const handleShare = (post) => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post._id}`);
    alert("Post link copied!");
  };

  /* ================= RENDER ================= */
  return (
    <div className="container mx-auto py-6 max-w-2xl space-y-6">
      <form onSubmit={handleSubmitPost} className="bg-white p-4 rounded shadow space-y-2">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border rounded p-2"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          {posting ? "Posting..." : "Post"}
        </button>
      </form>

      <div ref={feedRef} className="space-y-6">
        {loadingPosts ? (
          <>
            <SkeletonPost /><SkeletonPost /><SkeletonPost />
          </>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts yet</p>
        ) : (
          posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={currentUserId}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
            />
          ))
        )}
        {loadingMore && <p className="text-center text-gray-400">Loading more...</p>}
      </div>
    </div>
  );
};

export default Home;