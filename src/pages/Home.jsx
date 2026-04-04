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

const Home = () => {
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const feedRef = useRef();

  const { uploadImage } = useCloudinaryUpload();
  const { uploadVideo } = useR2Upload();

  const currentUser = {
    _id: currentUserId,
    profilePic: localStorage.getItem("profilePic"),
    name: localStorage.getItem("name"),
  };

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

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token]);

  /* Fetch Posts */
  const fetchPosts = useCallback(
    async (pageNum = 1) => {
      try {
        const res = await fetchWithToken(
          `${API_BASE}/api/posts?page=${pageNum}&limit=10`,
          token
        );

        if (!res || res.length === 0) {
          setHasMore(false);
          return;
        }

        setPosts((prev) => [...prev, ...res]);
      } catch (err) {
        console.log(err);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  /* Fetch Stories */

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

  /* Socket */

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

  /* Location Suggest */

  const handleLocationSearch = async (value) => {
    setLocation(value);

    if (!value) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${value}&format=json`
    );

    const data = await res.json();

    setLocationSuggestions(
      data.slice(0, 5).map((i) => i.display_name)
    );
  };

  /* Tag Friends */

  const handleTagFriends = (value) => {
    setTagInput(value);

    const names = value.split(",").map((n) => ({
      name: n.trim(),
    }));

    setTaggedFriends(names);
  };

  /* Submit Post */

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
      setExpanded(false);
      setLocation("");
      setFeeling("");
      setTaggedFriends([]);
    } catch (err) {
      console.log(err);
    }

    setPosting(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">

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
              <MediaUpload
                mediaFiles={mediaFiles}
                setMediaFiles={setMediaFiles}
              />

              {/* ACTION BUTTONS */}

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

              {/* EMOJI */}

              {showEmoji && (
                <Suspense fallback="Loading...">
                  <EmojiPicker
                    onEmojiClick={(e) =>
                      setNewPost((prev) => prev + e.emoji)
                    }
                  />
                </Suspense>
              )}

              {/* LOCATION */}

              {showLocation && (
                <div className="relative">
                  <input
                    value={location}
                    onChange={(e) =>
                      handleLocationSearch(e.target.value)
                    }
                    placeholder="Location"
                    className="w-full border p-2 rounded"
                  />

                  <div className="absolute w-full bg-white shadow rounded mt-1 z-50">
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

                </div>
              )}

              {/* FEELING */}

              {showFeeling && (
                <input
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                  placeholder="Feeling..."
                  className="w-full border p-2 rounded"
                />
              )}

              {/* TAG */}

              {showTag && (
                <input
                  value={tagInput}
                  onChange={(e) =>
                    handleTagFriends(e.target.value)
                  }
                  placeholder="Tag friends (comma separated)"
                  className="w-full border p-2 rounded"
                />
              )}

              {/* BUTTONS */}

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

        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={currentUserId}
          />
        ))}

        <div ref={feedRef} />

      </div>

      {/* RIGHT */}

      <div className="hidden md:block">
        <SidebarRight />
      </div>

    </div>
  );
};

export default Home;