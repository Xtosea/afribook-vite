// src/pages/Home.jsx
import React, { useEffect, useRef, useState, Suspense, lazy } from "react";
import PostCard from "../components/PostCard";
import SidebarLeft from "../components/layout/SidebarLeft";
import SidebarRight from "../components/layout/SidebarRight";
import StoriesBar from "../components/layout/StoriesBar";

import MediaUpload from "../components/MediaUpload";
import imageCompression from "browser-image-compression";
import { API_BASE, fetchWithToken } from "../api/api";
import { getSocket, connectSocket } from "../socket";
import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";

// Lazy load emoji picker
const EmojiPicker = lazy(() => import("emoji-picker-react"));

/* ================= SKELETON POST ================= */
const SkeletonPost = () => (
  <div className="bg-white p-4 rounded-2xl shadow animate-pulse space-y-4">
    <div className="h-64 bg-gray-300 rounded-xl"></div>
  </div>
);

/* ================= LAZY VIDEO ================= */
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

/* ================= HOME COMPONENT ================= */
const Home = () => {
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const currentUser = {
    _id: currentUserId,
    profilePic: localStorage.getItem("profilePic"),
    name: localStorage.getItem("name"),
  };

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const [stories, setStories] = useState([]);

  const feedRef = useRef();
  const { uploadImage } = useCloudinaryUpload();
  const { uploadVideo } = useR2Upload();

  const [videoRefs, setVideoRefs] = useState([]);
  useLazyVideo(videoRefs);

  /* ================= FETCH POSTS & STORIES ================= */
  useEffect(() => {
    const init = async () => {
      try {
        const postData = await fetchWithToken(`${API_BASE}/api/posts?limit=20`, token);
        setPosts(postData);

        const storyRes = await fetch(`${API_BASE}/api/stories?limit=20`);
        const storyData = await storyRes.json();
        setStories(storyData.stories || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPosts(false);
      }

      connectSocket();
      const socket = getSocket();
      if (!socket) return;

      socket.on("new-video", (post) => {
        setPosts((prev) => [post, ...prev]);
      });

      socket.on("new-story", (story) => {
        setStories((prev) => [story, ...prev]);
      });
    };

    init();

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off("new-video");
        socket.off("new-story");
      }
    };
  }, [token]);

  /* ================= CREATE POST ================= */
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost && mediaFiles.length === 0) return;
    setPosting(true);

    try {
      const uploadedMedia = [];
      for (let file of mediaFiles) {
        let compressedFile = file;
        if (file.type.startsWith("image")) {
          compressedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1280 });
        }
        const url = file.type.startsWith("image")
          ? await uploadImage(compressedFile)
          : await uploadVideo(compressedFile);
        uploadedMedia.push({ url, type: file.type.startsWith("image") ? "image" : "video" });
      }

      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPost, media: uploadedMedia }),
      });

      const data = await res.json();
      getSocket()?.emit("new-video", data.post);
      setPosts((prev) => [data.post, ...prev]);

      setNewPost("");
      setMediaFiles([]);
      setExpanded(false);
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-6 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* LEFT SIDEBAR */}
      <div className="hidden md:block">
        <SidebarLeft />
      </div>

      {/* MAIN FEED */}
      <div className="md:col-span-2 space-y-4">
        {/* STORIES BAR */}

        <StoriesBar user={currentUser} stories={stories} />

        {/* CREATE POST */}
        <form onSubmit={handleSubmitPost} className="bg-white p-4 rounded-xl shadow space-y-3">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="What's on your mind?"
            className="w-full border rounded-lg p-3"
          />
          {expanded && (
            <>
              <button
                type="button"
                onClick={() => setShowEmoji(!showEmoji)}
                className="border px-3 py-1 rounded-full"
              >
                😊 Emoji
              </button>
              {showEmoji && (
                <Suspense fallback={<div>Loading Emoji...</div>}>
                  <EmojiPicker onEmojiClick={(e) => setNewPost((prev) => prev + e.emoji)} />
                </Suspense>
              )}
              <MediaUpload mediaFiles={mediaFiles} setMediaFiles={setMediaFiles} />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                {posting ? "Posting..." : "Post"}
              </button>
            </>
          )}
        </form>

        {/* POSTS FEED */}
        <div ref={feedRef} className="space-y-4">
          {loadingPosts
            ? [<SkeletonPost key={0} />, <SkeletonPost key={1} />]
            : posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId={currentUserId}
                  setVideoRefs={setVideoRefs}
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