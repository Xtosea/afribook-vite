import React, { useEffect, useRef, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";

import SidebarLeft from "../components/layout/SidebarLeft";
import SidebarRight from "../components/layout/SidebarRight";
import StoriesBar from "../components/layout/StoriesBar";
import PostComposer from "../components/PostComposer";

import { API_BASE, fetchWithToken } from "../api/api";
import { getSocket, connectSocket } from "../socket";

// Lazy-loaded components
const PostCard = lazy(() => import("../components/PostCard"));

// Skeleton loader
const SkeletonPost = () => (
  <div className="bg-white p-4 rounded-2xl shadow animate-pulse space-y-4">
    <div className="h-64 bg-gray-300 rounded-xl"></div>
  </div>
);

// Lazy video hook
const useLazyVideo = (videos) => {
  useEffect(() => {
    if (!videos || videos.length === 0) return;

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

    videos.forEach((v) => observer.observe(v));

    return () => observer.disconnect();
  }, [videos]);
};

const Home = () => {
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const feedRef = useRef();
  const [videoRefs, setVideoRefs] = useState([]);

  useLazyVideo(videoRefs);

  const currentUser = {
    _id: currentUserId,
    profilePic: localStorage.getItem("profilePic"),
    name: localStorage.getItem("name"),
  };

  // redirect if no token
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // FETCH DATA + SOCKET INIT
  useEffect(() => {
    if (!token) return;

    const init = async () => {
      try {
        const postsData = await fetchWithToken(
          `${API_BASE}/api/posts?limit=20`,
          token
        );

        setPosts(Array.isArray(postsData) ? postsData : []);

        const res = await fetch(
          `${API_BASE}/api/stories?limit=20`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setStories(data.stories || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPosts(false);
      }

      // SOCKET CONNECTION
      connectSocket();
      const socket = getSocket();

      if (!socket) return;

      socket.on("new-post", (post) => {
        setPosts((prev) => {
          const exists = prev.some((p) => p._id === post._id);
          if (exists) return prev;
          return [post, ...prev];
        });
      });

      socket.on("new-story", (story) => {
        setStories((prev) => [story, ...prev]);
      });

      socket.on("birthday", (data) => {
        alert(`🎉 Today is ${data.name}'s birthday`);
      });
    };

    init();

    return () => {
      const socket = getSocket();
      if (!socket) return;

      socket.off("new-post");
      socket.off("new-story");
      socket.off("birthday");
    };
  }, [token]);

  return (
    <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
      
      {/* LEFT SIDEBAR */}
      <div className="hidden md:block md:col-span-1">
        <SidebarLeft />
      </div>

      {/* MAIN FEED */}
      <div className="md:col-span-2 space-y-4">

        {/* STORIES */}
        <StoriesBar user={currentUser} stories={stories} />

        {/* ✅ NEW POST COMPOSER */}
        <PostComposer
          token={token}
          currentUser={currentUser}
          onPostCreated={(post) => {
            setPosts((prev) => [post, ...prev]);
          }}
        />

        {/* POSTS */}
        <div ref={feedRef} className="space-y-4">
          {loadingPosts ? (
            <>
              <SkeletonPost />
              <SkeletonPost />
            </>
          ) : (
            Array.isArray(posts) &&
            posts.map((post) => (
              <Suspense fallback={<SkeletonPost />} key={post._id}>
                <PostCard
                  post={post}
                  currentUserId={currentUserId}
                  setVideoRefs={setVideoRefs}
                />
              </Suspense>
            ))
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="hidden md:block md:col-span-1">
        <SidebarRight />
      </div>
    </div>
  );
};

export default Home;