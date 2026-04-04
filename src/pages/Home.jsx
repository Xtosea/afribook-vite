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
import { API_BASE, fetchWithToken } from "../api/api";
import { getSocket, connectSocket } from "../socket";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

const Home = () => {
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const feedRef = useRef();

  const currentUser = {
    _id: currentUserId,
    profilePic: localStorage.getItem("profilePic"),
    name: localStorage.getItem("name"),
  };

  /* ================= STATES ================= */
  const [posts, setPosts] = useState([]);
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

  /* ================= AUTH ================= */
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  /* ================= FETCH POSTS ================= */
  const fetchPosts = useCallback(
    async (pageNum = 1) => {
      try {
        const res = await fetchWithToken(
          `${API_BASE}/api/posts?page=${pageNum}&limit=10`,
          token
        );

        if (!Array.isArray(res) || res.length === 0) {
          setHasMore(false);
          return;
        }

        setPosts((prev) => [...prev, ...res.filter(Boolean)]);
      } catch (err) {
        console.log("Fetch posts error:", err);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  /* ================= INFINITE SCROLL ================= */
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

  /* ================= FETCH STORIES ================= */
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStories(data?.stories || []);
      } catch (err) {
        console.log(err);
      }
    };
    if (token) fetchStories();
  }, [token]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    socket.on("new-post", (post) => {
      if (post) setPosts((prev) => [post, ...prev]);
    });

    socket.on("new-story", (story) => {
      if (story) setStories((prev) => [story, ...prev]);
    });

    return () => {
      socket.off("new-post");
      socket.off("new-story");
    };
  }, []);

  /* ================= LOCATION ================= */
  const handleLocationSearch = async (value) => {
    setLocation(value);
    if (!value) return setLocationSuggestions([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${value}&format=json`
      );
      const data = await res.json();
      setLocationSuggestions(data.slice(0, 5).map((item) => item.display_name));
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= TAG FRIENDS ================= */
  const handleTagFriends = (value) => {
    setTagInput(value);
    const names = value
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean)
      .map((name) => ({ name }));
    setTaggedFriends(names);
  };

  /* ================= SUBMIT POST ================= */
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost && mediaFiles.length === 0) return;

    setPosting(true);

    try {
      const formData = new FormData();
      formData.append("content", newPost);
      formData.append("location", location);
      formData.append("feeling", feeling);
      formData.append("taggedFriends", JSON.stringify(taggedFriends));

      mediaFiles.forEach((file) => {
        formData.append("media", file); // backend expects "media"
      });

      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch (err) {
        const text = await res.text();
        console.error("Server returned non-JSON:", text);
        setPosting(false);
        return;
      }

      if (data?.post) {
        setPosts((prev) => [data.post, ...prev]);
      }

      // Reset post creation state
      setNewPost("");
      setMediaFiles([]);
      setExpanded(false);
      setLocation("");
      setFeeling("");
      setTaggedFriends([]);
      setTagInput("");
      setShowEmoji(false);
      setShowLocation(false);
      setShowFeeling(false);
      setShowTag(false);
    } catch (err) {
      console.log("Post error:", err);
    }

    setPosting(false);
  };

  /* ================= UI ================= */
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto px-2">
      {/* LEFT */}
      <div className="hidden md:block">
        <SidebarLeft />
      </div>

      {/* CENTER */}
      <div className="space-y-4">
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
            className="w-full border rounded-lg p-3 focus:outline-none"
          />

          {expanded && (
            <>
              <MediaUpload mediaFiles={mediaFiles} setMediaFiles={setMediaFiles} />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="px-3 py-2 bg-gray-100 rounded-lg"
                >
                  😊 Emoji
                </button>
                <button
                  type="button"
                  onClick={() => setShowLocation(!showLocation)}
                  className="px-3 py-2 bg-gray-100 rounded-lg"
                >
                  📍 Location
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeeling(!showFeeling)}
                  className="px-3 py-2 bg-gray-100 rounded-lg"
                >
                  😊 Feeling
                </button>
                <button
                  type="button"
                  onClick={() => setShowTag(!showTag)}
                  className="px-3 py-2 bg-gray-100 rounded-lg"
                >
                  🏷 Tag Friends
                </button>
              </div>

              {showEmoji && (
                <Suspense fallback="Loading...">
                  <EmojiPicker onEmojiClick={(e) => setNewPost((prev) => prev + e.emoji)} />
                </Suspense>
              )}

              {showLocation && (
                <div className="relative">
                  <input
                    value={location}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    placeholder="Location"
                    className="w-full border p-2 rounded"
                  />
                  {locationSuggestions.length > 0 && (
                    <div className="absolute w-full bg-white shadow rounded mt-1 z-50 max-h-48 overflow-y-auto">
                      {locationSuggestions.map((loc, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setLocation(loc);
                            setLocationSuggestions([]);
                          }}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {loc}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showFeeling && (
                <input
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                  placeholder="Feeling..."
                  className="w-full border p-2 rounded"
                />
              )}

              {showTag && (
                <input
                  value={tagInput}
                  onChange={(e) => handleTagFriends(e.target.value)}
                  placeholder="Tag friends (comma separated)"
                  className="w-full border p-2 rounded"
                />
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg"
                >
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>
            </>
          )}
        </form>

        {/* POSTS */}
        {Array.isArray(posts) &&
          posts.filter(Boolean).map((post) => (
            <PostCard key={post?._id} post={post} currentUser