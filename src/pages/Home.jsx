// src/pages/Home.jsx
import React, { useEffect, useRef, useState, Suspense, lazy, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLeft from "../components/layout/SidebarLeft";
import SidebarRight from "../components/layout/SidebarRight";
import StoriesBar from "../components/layout/StoriesBar";
import PostCard from "../components/PostCard";
import MediaUpload from "../components/MediaUpload";
import imageCompression from "browser-image-compression";
import { API_BASE, fetchWithToken } from "../api/api";
import { getSocket, connectSocket } from "../socket";
import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

const SkeletonPost = () => (
  <div className="bg-white p-4 rounded-2xl shadow animate-pulse space-y-4 w-full">
    <div className="h-64 bg-gray-300 rounded-xl w-full"></div>
  </div>
);

const useLazyVideo = (videos) => {
  useEffect(() => {
    if (!videos?.length) return;

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

    videos.forEach((v) => v && observer.observe(v));

    return () => observer.disconnect();
  }, [videos]);
};

const Home = () => {
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const feedRef = useRef();

  const { uploadImage } = useCloudinaryUpload();
  const { uploadVideo } = useR2Upload();

  const [videoRefs, setVideoRefs] = useState([]);
  useLazyVideo(videoRefs);

  const currentUser = {
    _id: currentUserId,
    profilePic: localStorage.getItem("profilePic"),
    name: localStorage.getItem("name"),
  };

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [stories, setStories] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [location, setLocation] = useState("");
  const [feeling, setFeeling] = useState("");
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const fetchPosts = useCallback(
    async (pageNum = 1) => {
      if (!token || !hasMore) return;

      try {
        const res = await fetchWithToken(
          `${API_BASE}/api/posts?limit=10&page=${pageNum}`,
          token
        );

        if (!res || !Array.isArray(res) || res.length === 0) {
          setHasMore(false);
          return;
        }

        setPosts((prev) => [...prev, ...res]);
      } catch (err) {
        console.error("Posts fetch error:", err);
      } finally {
        setLoadingPosts(false);
      }
    },
    [token, hasMore]
  );

  useEffect(() => {
    fetchPosts(page);
  }, [fetchPosts, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingPosts) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (feedRef.current) observer.observe(feedRef.current);

    return () => observer.disconnect();
  }, [feedRef, hasMore, loadingPosts]);

  useEffect(() => {
    if (!token) return;

    const fetchStories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stories?limit=20`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setStories(data?.stories || []);
      } catch (err) {
        console.error("Stories fetch error:", err);
      }
    };

    fetchStories();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    connectSocket();
    const socket = getSocket();

    if (!socket) return;

    socket.on("new-video", (post) => {
      setPosts((prev) => [post, ...prev]);
    });

    socket.on("new-story", (story) => {
      setStories((prev) => [story, ...prev]);
    });

    socket.on("birthday", (data) => {
      alert(`🎉 Today is ${data.name}'s birthday`);
    });

    return () => {
      socket.off("new-video");
      socket.off("new-story");
      socket.off("birthday");
    };
  }, [token]);

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

        uploadedMedia.push({
          url,
          type,
        });
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
    <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-3">

      <div className="hidden md:block">
        <SidebarLeft />
      </div>

      <div className="col-span-1 md:col-span-2 space-y-4 px-2">

        <StoriesBar user={currentUser} stories={stories || []} />

        <form
          onSubmit={handleSubmitPost}
          className="bg-white p-4 rounded-xl shadow space-y-3"
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
              <MediaUpload
                mediaFiles={mediaFiles}
                setMediaFiles={setMediaFiles}
              />

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
            </>
          )}
        </form>

        <div className="space-y-4">

          {loadingPosts ? (
            <>
              <SkeletonPost />
              <SkeletonPost />
            </>
          ) : posts?.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={currentUserId}
                setVideoRefs={setVideoRefs}
              />
            ))
          ) : (
            <p className="text-center text-gray-400">
              No posts found
            </p>
          )}

          <div ref={feedRef} />

          {!hasMore && !loadingPosts && posts?.length > 0 && (
            <p className="text-center text-gray-400 py-4">
              No more posts
            </p>
          )}
        </div>
      </div>

      <div className="hidden md:block">
        <SidebarRight />
      </div>

    </div>
  );
};

export default Home;