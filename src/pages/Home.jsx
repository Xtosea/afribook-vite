// src/pages/Home.jsx
import React, { useEffect, useRef, useState, Suspense, lazy, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLeft from "../components/layout/SidebarLeft";
import SidebarRight from "../components/layout/SidebarRight";
import StoriesBar from "../components/layout/StoriesBar";
import PostCard from "../components/PostCard";
import { API_BASE, fetchWithToken } from "../api/api";
import { getSocket, connectSocket } from "../socket";
import CreatePost from "../components/CreatePost"; // <-- Import the new component

// Lazy load emoji picker
const EmojiPicker = lazy(() => import("emoji-picker-react"));

// Skeleton post
const SkeletonPost = () => (
  <div className="bg-white p-4 rounded-2xl shadow animate-pulse space-y-4 w-full">
    <div className="h-64 bg-gray-300 rounded-xl w-full"></div>
  </div>
);

const Home = () => {
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const feedRef = useRef();

  const currentUser = {
    _id: currentUserId,
    profilePic: localStorage.getItem("profilePic"),
    name: localStorage.getItem("name"),
  };

  // Redirect if no token
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // --- Socket setup ---
  useEffect(() => {
    if (!token) return;
    connectSocket();
    const socket = getSocket();
    if (!socket) return;

    socket.on("new-video", (post) => setPosts((prev) => [post, ...prev]));
    socket.on("new-story", (story) => setStories((prev) => [story, ...prev]));
    socket.on("birthday", (data) => alert(`🎉 Today is ${data.name}'s birthday`));

    return () => {
      socket.off("new-video");
      socket.off("new-story");
      socket.off("birthday");
    };
  }, [token]);

  // --- Fetch stories ---
  useEffect(() => {
    if (!token) return;

    const fetchStories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stories?limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStories(data.stories || []);
      } catch (err) {
        console.error("Stories fetch error:", err);
      }
    };

    fetchStories();
  }, [token]);

  // --- Fetch posts (infinite scroll) ---
  const fetchPosts = useCallback(async (pageNum = 1) => {
    if (!token || !hasMore) return;

    try {
      const res = await fetchWithToken(
        `${API_BASE}/api/posts?limit=10&page=${pageNum}`,
        token
      );
      if (!res || res.length === 0) {
        setHasMore(false);
        return;
      }
      setPosts((prev) => [...prev, ...res]);
    } catch (err) {
      console.error("Posts fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, hasMore]);

  // Initial posts
  useEffect(() => {
    fetchPosts(page);
  }, [fetchPosts, page]);

  // --- Infinite scroll ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (feedRef.current) observer.observe(feedRef.current);

    return () => observer.disconnect();
  }, [feedRef, hasMore, loading]);

  // --- Handler for new post created ---
  const handleNewPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-3 gap-0">

      {/* LEFT SIDEBAR */}
      <div className="hidden md:block">
        <SidebarLeft />
      </div>

      {/* MAIN FEED */}
      <div className="col-span-1 md:col-span-2 space-y-4 w-full px-2">

        {/* STORIES */}
        <StoriesBar user={currentUser} stories={stories} />

        {/* CREATE POST */}
        <CreatePost currentUser={currentUser} onPostCreated={handleNewPost} />

        {/* POSTS */}
        {posts.map((post) => (
          <PostCard key={post._id} post={post} currentUserId={currentUserId} feedRef={feedRef} />
        ))}

        {/* LOADING */}
        {loading && (
          <>
            <SkeletonPost />
            <SkeletonPost />
          </>
        )}

        {/* SCROLL SENTINEL */}
        <div ref={feedRef} />

        {!hasMore && !loading && (
          <p className="text-center text-gray-400 py-4">No more posts</p>
        )}
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="hidden md:block">
        <SidebarRight />
      </div>
    </div>
  );
};

export default Home;