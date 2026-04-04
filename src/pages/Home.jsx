// src/pages/Home.jsx
import React, {
  useEffect,
  useRef,
  useState,
  Suspense,
  lazy,
  useCallback,
} from "react";

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
  <div className="bg-white p-4 rounded-2xl shadow animate-pulse">
    <div className="h-64 bg-gray-300 rounded-xl"></div>
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

  // Post states
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [stories, setStories] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  const [feeling, setFeeling] = useState("");

  const [taggedFriends, setTaggedFriends] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [showEmoji, setShowEmoji] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showFeeling, setShowFeeling] = useState(false);
  const [showTag, setShowTag] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // Fetch posts
  const fetchPosts = useCallback(
    async (pageNum = 1) => {
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
        console.error(err);
      } finally {
        setLoadingPosts(false);
      }
    },
    [token, hasMore]
  );

  useEffect(() => {
    fetchPosts(page);
  }, [fetchPosts, page]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (feedRef.current) observer.observe(feedRef.current);

    return () => observer.disconnect();
  }, [hasMore]);

  // Fetch stories
  useEffect(() => {
    const fetchStories = async () => {
      const res = await fetch(`${API_BASE}/api/stories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setStories(data?.stories || []);
    };

    if (token) fetchStories();
  }, [token]);

  // Socket
  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    socket.on("new-video", (post) => {
      setPosts((prev) => [post, ...prev]);
    });

    socket.on("new-story", (story) => {
      setStories((prev) => [story, ...prev]);
    });

    return () => {
      socket.off("new-video");
      socket.off("new-story");
    };
  }, []);

  // Location Auto Suggest
  const handleLocationSearch = async (value) => {
    setLocation(value);

    if (!value) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${value}&format=json`
      );

      const data = await res.json();

      setLocationSuggestions(
        data.slice(0, 5).map((item) => item.display_name)
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleTagFriends = (value) => {
    setTagInput(value);

    const names = value.split(",").map((n) => ({
      name: n.trim(),
    }));

    setTaggedFriends(names);
  };

  // Submit Post
  const handleSubmitPost = async (e) => {
    e.preventDefault();

    if (!newPost && mediaFiles.length === 0) return;

    setPosting(true);

    try {
      const uploadedMedia = [];

      for (let file of mediaFiles) {
        const type = file.type.startsWith("image")
          ? "image"
          : "video";

        let compressed = file;

        if (type === "image") {
          compressed = await imageCompression(file, {
            maxSizeMB: 0.6,
          });
        }

        const url =
          type === "image"
            ? await uploadImage(compressed)
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

      setPosts((prev) => [data.post, ...prev]);

      setNewPost("");
      setMediaFiles([]);
      setLocation("");
      setFeeling("");
      setTaggedFriends([]);
      setExpanded(false);
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3">

      <div className="hidden md:block">
        <SidebarLeft />
      </div>

      <div className="space-y-4 px-2">

        <StoriesBar user={currentUser} stories={stories} />

        {/* CREATE POST */}

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

              <div className="flex gap-2 flex-wrap">

                <button
                  type="button"
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="btn"
                >
                  😊 Emoji
                </button>

                <button
                  type="button"
                  onClick={() => setShowLocation(!showLocation)}
                  className="btn"
                >
                  📍 Location
                </button>

                <button
                  type="button"
                  onClick={() => setShowFeeling(!showFeeling)}
                  className="btn"
                >
                  😊 Feeling
                </button>

                <button
                  type="button"
                  onClick={() => setShowTag(!showTag)}
                  className="btn"
                >
                  🏷 Tag
                </button>

              </div>

              {showEmoji && (
                <Suspense fallback="Loading...">
                  <EmojiPicker
                    onEmojiClick={(e) =>
                      setNewPost((prev) => prev + e.emoji)
                    }
                  />
                </Suspense>
              )}

              {showFeeling && (
                <input
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                  placeholder="Feeling..."
                  className="input"
                />
              )}

              {showLocation && (
                <div>
                  <input
                    value={location}
                    onChange={(e) =>
                      handleLocationSearch(e.target.value)
                    }
                    placeholder="Location"
                    className="input"
                  />

                  {locationSuggestions.map((loc, i) => (
                    <div
                      key={i}
                      onClick={() => setLocation(loc)}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {loc}
                    </div>
                  ))}
                </div>
              )}

              {showTag && (
                <input
                  value={tagInput}
                  onChange={(e) =>
                    handleTagFriends(e.target.value)
                  }
                  placeholder="Tag friends"
                  className="input"
                />
              )}

              <div className="flex justify-between">

                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={posting}
                  className="px-6 py-2 bg-blue-500 text-white rounded"
                >
                  {posting ? "Posting..." : "Post"}
                </button>

              </div>
            </>
          )}

        </form>

        {/* POSTS */}

        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={currentUserId}
            setVideoRefs={setVideoRefs}
          />
        ))}

        <div ref={feedRef} />

      </div>

      <div className="hidden md:block">
        <SidebarRight />
      </div>

    </div>
  );
};

export default Home;