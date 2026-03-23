import React, { useEffect, useRef, useState } from "react";
import { API_BASE, fetchWithToken } from "../api/api";
import PostCard from "../components/PostCard";
import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";

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
  const [posting, setPosting] = useState(false);

  const feedRef = useRef();
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
    if (posts.length > 0) {
      localStorage.setItem("feed_posts", JSON.stringify(posts));
    }
  }, [posts]);

  /* ================= FETCH POSTS ================= */
  const fetchPosts = async (pageNum = 1) => {
    if (!token) return;

    try {
      pageNum === 1 ? setLoadingPosts(true) : setLoadingMore(true);

      const data = await fetchWithToken(
        `${API_BASE}/api/posts?limit=10&page=${pageNum}`,
        token
      );

      const fixedPosts = data.map((post) => ({
        ...post,
        media: post.media?.map((m) => ({
          ...m,
          url: m.url.startsWith("http") ? m.url : `${API_BASE}${m.url}`,
        })),
      }));

      if (pageNum === 1) {
        setPosts(fixedPosts);
      } else {
        setPosts((prev) => [...prev, ...fixedPosts]);
      }

      if (data.length < 10) setHasMore(false);
    } catch (err) {
      console.error("FETCH POSTS ERROR:", err);
    } finally {
      setLoadingPosts(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

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
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (posting || !newPost.trim()) return;

    setPosting(true);

    try {
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newPost }),
      });

      const data = await res.json();

      setPosts((prev) => [data.post, ...prev]);
      setNewPost("");
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container mx-auto py-6 max-w-2xl space-y-6">

      {/* CREATE POST */}
      <form onSubmit={handleSubmitPost} className="bg-white p-4 rounded shadow">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border rounded p-2"
        />
        <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
          {posting ? "Posting..." : "Post"}
        </button>
      </form>

      {/* POSTS */}
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
              className="bg-white rounded shadow overflow-hidden"
            >
              {post.media?.map((m, i) => (
                <div key={i}>
                  {m.type === "image" ? (
                    <img src={m.url} className="w-full h-64 object-cover" />
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

              <PostCard post={post} currentUserId={currentUserId} />
            </div>
          ))
        )}

        {loadingMore && (
          <p className="text-center text-gray-400">Loading more...</p>
        )}
      </div>
    </div>
  );
};

export default Home;