// src/pages/Home.jsx
import React, { useEffect, useRef, useState, Suspense, lazy, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLeft from "../components/layout/SidebarLeft";
import SidebarRight from "../components/layout/SidebarRight";
import StoriesBar from "../components/layout/StoriesBar";
import PostCard from "../components/PostCard";
import imageCompression from "browser-image-compression";
import { API_BASE, fetchWithToken } from "../api/api";
import { getSocket, connectSocket } from "../socket";
import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";

// Lazy load emoji picker
const EmojiPicker = lazy(() => import("emoji-picker-react"));

// Skeleton post for loading
const SkeletonPost = () => (
  <div className="bg-white p-4 rounded-2xl shadow animate-pulse space-y-4 w-full">
    <div className="h-64 bg-gray-300 rounded-xl w-full"></div>
  </div>
);

// Lazy video hook
const useLazyVideo = (videosRef) => {
  useEffect(() => {
    if (!videosRef.current) return;
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
    const vids = videosRef.current.querySelectorAll("video[data-src]");
    vids.forEach((v) => observer.observe(v));
    return () => observer.disconnect();
  }, [videosRef]);
};

const Home = () => {
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const currentUser = {
    _id: currentUserId,
    profilePic: localStorage.getItem("profilePic"),
    name: localStorage.getItem("name"),
  };

  // --- States ---
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [stories, setStories] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [location, setLocation] = useState("");
  const [feeling, setFeeling] = useState("");
  const [taggedFriends, setTaggedFriends] = useState([]);

  const feedRef = useRef();
  const { uploadImage } = useCloudinaryUpload();
  const { uploadVideo } = useR2Upload();

  useLazyVideo(feedRef);

  // --- Pagination for faster loading ---
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPostsAndStories = useCallback(async () => {
    if (!token) return;
    try {
      // Fetch posts (paginated)
      const postsData = await fetchWithToken(
        `${API_BASE}/api/posts?limit=5&page=${page}`,
        token
      );
      setPosts((prev) => [...prev, ...postsData]);
      if (postsData.length < 5) setHasMore(false);

      // Only fetch stories once
      if (page === 1) {
        const res = await fetch(`${API_BASE}/api/stories?limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = { stories: [] };
        }
        setStories(data.stories || []);
      }
    } catch (err) {
      console.error("Error fetching posts/stories:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, [token, page]);

  useEffect(() => {
    fetchPostsAndStories();
  }, [fetchPostsAndStories]);

  // --- Infinite scroll ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingPosts) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 1 }
    );
    if (feedRef.current?.lastElementChild) {
      observer.observe(feedRef.current.lastElementChild);
    }
    return () => observer.disconnect();
  }, [posts, hasMore, loadingPosts]);

  // --- Socket connection ---
  useEffect(() => {
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
  }, []);

  // --- Create post ---
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost && mediaFiles.length === 0) return;
    setPosting(true);

    try {
      const uploadedMedia = [];
      for (let file of mediaFiles) {
        let compressedFile = file;
        const type = file.type.startsWith("image") ? "image" : "video";

        if (type === "image") {
          compressedFile = await imageCompression(file, {
            maxSizeMB: 0.6,
            maxWidthOrHeight: 1080,
            useWebWorker: true,
            fileType: "image/webp",
            initialQuality: 0.8,
          });
        }

        const url =
          type === "image"
            ? await uploadImage(compressedFile)
            : await uploadVideo(file);
        uploadedMedia.push({ url, type });
      }

      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newPost,
          media: uploadedMedia,
          location,
          feeling,
          taggedFriends,
        }),
      });

      const data = await res.json();
      getSocket()?.emit("new-video", data.post);
      setPosts((prev) => [data.post, ...prev]);

      // Reset form
      setNewPost("");
      setMediaFiles([]);
      setLocation("");
      setFeeling("");
      setTaggedFriends([]);
      setExpanded(false);
    } catch (err) {
      console.error("Post creation error:", err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 p-2">

      {/* LEFT SIDEBAR */}
      <div className="hidden md:block">
        <SidebarLeft />
      </div>

      {/* MAIN FEED */}
      <div className="space-y-4 w-full">
        <StoriesBar user={currentUser} stories={stories} />

        {/* CREATE POST */}
        <form
          onSubmit={handleSubmitPost}
          className="bg-white p-4 rounded-xl shadow space-y-3 w-full"
        >
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="What's on your mind?"
            className="w-full border rounded-lg p-3"
          />
          {expanded && (
            <>
              <input
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                placeholder="Feeling..."
                className="w-full border rounded-lg p-2"
              />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location..."
                className="w-full border rounded-lg p-2"
              />
              <input
                value={taggedFriends.map((f) => f.name).join(", ")}
                onChange={(e) =>
                  setTaggedFriends(
                    e.target.value
                      .split(",")
                      .map((n) => ({ name: n.trim() }))
                  )
                }
                placeholder="Tag friends (comma separated)"
                className="w-full border rounded-lg p-2"
              />
            </>
          )}
        </form>

        {/* POSTS FEED */}
        <div ref={feedRef} className="space-y-4 w-full">
          {loadingPosts && page === 1
            ? [<SkeletonPost key={0} />, <SkeletonPost key={1} />]
            : posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId={currentUserId}
                  feedRef={feedRef}
                />
              ))}
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="hidden md:block">
        <SidebarRight />
      </div>
    </div>
  );
};

export default Home;