// src/pages/Home.jsx
import React, { useEffect, useRef, useState } from "react";
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
import EmojiPicker from "emoji-picker-react";

/* LAZY VIDEO */
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

const SkeletonPost = () => (
  <div className="bg-white p-4 rounded-2xl shadow animate-pulse space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-300 rounded w-full"></div>
      <div className="h-3 bg-gray-300 rounded w-5/6"></div>
    </div>
    <div className="h-64 bg-gray-300 rounded-xl"></div>
    <div className="flex justify-between pt-2">
      <div className="h-4 bg-gray-300 rounded w-16"></div>
      <div className="h-4 bg-gray-300 rounded w-16"></div>
      <div className="h-4 bg-gray-300 rounded w-16"></div>
    </div>
  </div>
);

const Home = () => {
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [newPost, setNewPost] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const feedRef = useRef();
  const { uploadImage } = useCloudinaryUpload();
  const { uploadVideo } = useR2Upload();

  useLazyVideo(feedRef);

  useEffect(() => connectSocket(), []);

  /* FETCH POSTS */
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await fetchWithToken(`${API_BASE}/api/posts`, token);
        const fixed = data.map((post) => ({
  ...post,

  media: post.media?.map((m) => ({
    ...m,
    url: m?.url
      ? m.url.startsWith("http")
        ? m.url
        : `${API_BASE}${m.url}`
      : "",
  })) || [],

  user: {
    ...post.user,
    profilePic:
      post?.user?.profilePic
        ? post.user.profilePic.startsWith("http")
          ? post.user.profilePic
          : `${API_BASE}${post.user.profilePic}`
        : "/default-avatar.png",
  },

}));
          user: {
            ...post.user,
            profilePic: post.user.profilePic
              ? post.user.profilePic.startsWith("http")
                ? post.user.profilePic
                : `${API_BASE}${post.user.profilePic}`
              : "/default-avatar.png",
          },
        }));
        setPosts(fixed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [token]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handleNewVideo = (post) => setPosts((prev) => [post, ...prev]);
    socket.on("new-video", handleNewVideo);
    return () => socket.off("new-video", handleNewVideo);
  }, []);

  /* CREATE POST */
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost && mediaFiles.length === 0) return;

    setPosting(true);
    setUploadProgress({});
    try {
      const uploadedMedia = [];
      for (let i = 0; i < mediaFiles.length; i++) {
        let file = mediaFiles[i];
        if (file.type.startsWith("image")) {
          file = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1280 });
        }
        const url = file.type.startsWith("image")
          ? await uploadImage(file, (p) => setUploadProgress((prev) => ({ ...prev, [i]: p })))
          : await uploadVideo(file, (p) => setUploadProgress((prev) => ({ ...prev, [i]: p })));
        uploadedMedia.push({ url, type: file.type.startsWith("image") ? "image" : "video" });
      }

      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPost, media: uploadedMedia }),
      });
      const data = await res.json();

      // map profilePic
      const newPostData = {
        ...data.post,
        media: data.post.media,
        user: {
          ...data.post.user,
          profilePic: data.post.user.profilePic
            ? data.post.user.profilePic.startsWith("http")
              ? data.post.user.profilePic
              : `${API_BASE}${data.post.user.profilePic}`
            : "/default-avatar.png",
        },
      };

      setPosts((prev) => [newPostData, ...prev]);
      getSocket()?.emit("new-video", newPostData);

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

  const handleLike = (postId) => getSocket()?.emit("like-video", { videoId: postId, userId: currentUserId });
  const handleComment = (postId, text) => getSocket()?.emit("comment-video", { videoId: postId, text });
  const handleShare = (post) => { navigator.clipboard.writeText(`${window.location.origin}/posts/${post._id}`); alert("Copied!"); };

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-6 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="hidden md:block"><SidebarLeft /></div>

      <div className="md:col-span-2 space-y-4">
        <StoriesBar posts={posts} />

        <form onSubmit={handleSubmitPost} className="bg-white p-4 rounded-xl shadow space-y-3">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="What's on your mind?"
            className="w-full border rounded-lg p-3"
          />

          {expanded && <>
            <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="border px-3 py-1 rounded-full">😊 Emoji</button>
            {showEmoji && <EmojiPicker onEmojiClick={(e) => setNewPost((prev) => prev + e.emoji)} />}
            <MediaUpload mediaFiles={mediaFiles} setMediaFiles={setMediaFiles} uploadProgress={uploadProgress} />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">{posting ? "Posting..." : "Post"}</button>
          </>}

        </form>

        <div ref={feedRef} className="space-y-4">
          {loadingPosts ? [<SkeletonPost key={1}/>, <SkeletonPost key={2}/>] : posts.map((post) => (
            <PostCard key={post._id} post={post} currentUserId={currentUserId} onLike={handleLike} onComment={handleComment} onShare={handleShare} />
          ))}
        </div>
      </div>

      <div className="hidden md:block"><SidebarRight /></div>
    </div>
  );
};

export default Home;