// src/pages/Home.jsx
import React, { useEffect, useRef, useState } from "react";
import PostCard from "../components/PostCard";
import SidebarLeft from "../components/layout/SidebarLeft";
import SidebarRight from "../components/layout/SidebarRight";
import StoriesBar from "../components/layout/StoriesBar";
import MediaUpload from "../components/MediaUpload";
import imageCompression from "browser-image-compression";

import { API_BASE, fetchWithToken } from "../api/api";
import { socket } from "../socket";
import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";

import EmojiPicker from "emoji-picker-react";

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

  const [newPost, setNewPost] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({}); // ✅ NEW

  const [expanded, setExpanded] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const feedRef = useRef();

  const { uploadImage } = useCloudinaryUpload();
  const { uploadVideo } = useR2Upload();

  useLazyVideo(feedRef);

  /* ================= FETCH POSTS ================= */
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await fetchWithToken(`${API_BASE}/api/posts`, token);

        const fixed = data.map((post) => ({
          ...post,
          media: post.media?.map((m) => ({
            ...m,
            url: m.url.startsWith("http") ? m.url : `${API_BASE}${m.url}`,
          })),
        }));

        setPosts(fixed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, []);

  /* ================= CREATE POST ================= */
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost && mediaFiles.length === 0) return;

    setPosting(true);
    setUploadProgress({}); // reset

    try {
      const uploadedMedia = [];

      for (let i = 0; i < mediaFiles.length; i++) {
        let file = mediaFiles[i];

        try {
          // ✅ COMPRESS IMAGE
          if (file.type.startsWith("image")) {
            file = await imageCompression(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1280,
              useWebWorker: true,
            });
          }

          let url;

          if (file.type.startsWith("image")) {
            url = await uploadImage(file, (progress) => {
              setUploadProgress((prev) => ({
                ...prev,
                [i]: progress,
              }));
            });
          } else {
            url = await uploadVideo(file, (progress) => {
              setUploadProgress((prev) => ({
                ...prev,
                [i]: progress,
              }));
            });
          }

          uploadedMedia.push({
            url,
            type: file.type.startsWith("image") ? "image" : "video",
          });

        } catch (err) {
          console.error("UPLOAD ERROR:", err);
        }
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
        }),
      });

      const data = await res.json();

      setPosts((prev) => [data.post, ...prev]);
      socket.emit("new-video", data.post);

      // RESET
      setNewPost("");
      setMediaFiles([]);
      setUploadProgress({});
      setExpanded(false);

    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  /* ================= INTERACTIONS ================= */
  const handleLike = (postId) => {
    socket.emit("like-video", { videoId: postId, userId: currentUserId });
  };

  const handleComment = (postId, text) => {
    socket.emit("comment-video", { videoId: postId, text });
  };

  const handleShare = (post) => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post._id}`);
    alert("Copied!");
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    socket.on("new-video", (post) => setPosts((prev) => [post, ...prev]));

    return () => {
      socket.off("new-video");
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-6 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">

      {/* LEFT */}
      <div className="hidden md:block">
        <SidebarLeft />
      </div>

      {/* CENTER */}
      <div className="md:col-span-2 space-y-4">

        <StoriesBar posts={posts} />

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
                <EmojiPicker
                  onEmojiClick={(e) =>
                    setNewPost((prev) => prev + e.emoji)
                  }
                />
              )}

              {/* ✅ MEDIA UPLOAD */}
              <MediaUpload
                mediaFiles={mediaFiles}
                setMediaFiles={setMediaFiles}
                uploadProgress={uploadProgress}
              />

              <button className="bg-blue-500 text-white px-4 py-2 rounded">
                {posting ? "Posting..." : "Post"}
              </button>
            </>
          )}
        </form>

        {/* POSTS */}
        <div ref={feedRef} className="space-y-4">
          {loadingPosts ? (
            <>
              <SkeletonPost />
              <SkeletonPost />
            </>
          ) : (
            posts.map((post) => (
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
        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden md:block">
        <SidebarRight />
      </div>
    </div>
  );
};

export default Home;