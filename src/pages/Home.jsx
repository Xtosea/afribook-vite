import React, {
  useEffect,
  useRef,
  useState,
  Suspense,
  lazy,
} from "react";
import { useNavigate } from "react-router-dom";

import SidebarLeft from "../components/layout/SidebarLeft";
import SidebarRight from "../components/layout/SidebarRight";
import StoriesBar from "../components/layout/StoriesBar";
import MediaUpload from "../components/MediaUpload";

import imageCompression from "browser-image-compression";
import { API_BASE, fetchWithToken } from "../api/api";
import { getSocket, connectSocket } from "../socket";

import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";
import validateVideoDuration from "../utils/validateVideoDuration";
import compressVideo from "../utils/compressVideo";


// Lazy-loaded components
const EmojiPicker = lazy(() => import("emoji-picker-react"));
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

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting) {
          if (!video.src) video.src = video.dataset.src;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.5 });

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

  const [newPost, setNewPost] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [posting, setPosting] = useState(false);

  const [expanded, setExpanded] = useState(false);

  const [showEmoji, setShowEmoji] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showFeeling, setShowFeeling] = useState(false);
  const [showTag, setShowTag] = useState(false);

  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  const [feeling, setFeeling] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [taggedFriends, setTaggedFriends] = useState([]);

  const feedRef = useRef();
  const [videoRefs, setVideoRefs] = useState([]);

  useLazyVideo(videoRefs);

  const { uploadImage } = useCloudinaryUpload();
  const { uploadVideo } = useR2Upload();

  const currentUser = {
    _id: currentUserId,
    profilePic: localStorage.getItem("profilePic"),
    name: localStorage.getItem("name"),
  };

  // redirect if no token
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // FETCH DATA
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

    // CONNECT SOCKET
    connectSocket();

    const socket = getSocket();

    if (!socket) return;

    // NEW POST
    socket.on("new-post", (post) => {

      setPosts((prev) => {

        const exists = prev.some(
          (p) => p._id === post._id
        );

        if (exists) return prev;

        return [post, ...prev];
      });

    });

    // NEW STORY
    socket.on("new-story", (story) => {
      setStories((prev) => [story, ...prev]);
    });

    // BIRTHDAY
    socket.on("birthday", (data) => {
      alert(`🎉 Today is ${data.name}'s birthday`);
    });

  };

  // RUN INIT
  init();

  // CLEANUP
  return () => {

    const socket = getSocket();

    if (!socket) return;

    socket.off("new-post");
    socket.off("new-story");
    socket.off("birthday");

  };

}, [token]);
  // LOCATION SEARCH
  const handleLocationSearch = async (value) => {
    setLocation(value);

    if (value.length < 2) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${value}`
      );

      const data = await res.json();

      setLocationSuggestions(
        data.slice(0, 5).map((item) => item.display_name)
      );
    } catch (err) {
      console.log(err);
    }
  };

  // TAG FRIENDS
  const handleTagFriends = (value) => {
    setTagInput(value);
    setTaggedFriends(value.split(","));
  };

  // SUBMIT POST
  const handleSubmitPost = async (e) => {
  e.preventDefault();

  if (!newPost && mediaFiles.length === 0) return;

  setPosting(true);

  try {

    const uploadedMedia = [];

    // Upload all files first
    for (let file of mediaFiles) {

      const type = file.type.startsWith("image")
        ? "image"
        : "video";

      let url = "";

      // IMAGE
      if (type === "image") {

        url = await uploadImage(file);

      } else {

        // VIDEO → R2
        await validateVideoDuration(file, 60);

         url = await uploadVideo(file);

      }

      uploadedMedia.push({
        url,
        type,
      });
    }

    // CREATE POST IN DATABASE
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

// Socket.IO will add the post automatically

setNewPost("");
setMediaFiles([]);

  } catch (err) {

    console.error(err);
    alert("Post failed");

  }

  setPosting(false);
};

  return (
    <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto">

      {/* LEFT SIDEBAR */}
      <div className="hidden md:block md:col-span-1">
        <SidebarLeft />
      </div>

      {/* MAIN FEED */}
      <div className="md:col-span-2 space-y-4">

        <StoriesBar user={currentUser} stories={stories} />

        {/* CREATE POST */}
        <form
          onSubmit={handleSubmitPost}
          className="bg-white p-4 rounded-xl shadow space-y-3"
        >
          <textarea
            rows={expanded ? 3 : 1}
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="What's on your mind?"
            className="w-full border rounded-lg p-3"
          />

          {expanded && (
            <div className="space-y-3">
              <MediaUpload
                mediaFiles={mediaFiles}
                setMediaFiles={setMediaFiles}
              />

              <div className="flex gap-2 flex-wrap">


{/* EMOJI PICKER */}
{showEmoji && (
  <div className="border rounded-xl p-2">
    <Suspense fallback={<div>Loading emojis...</div>}>
      <EmojiPicker
        onEmojiClick={(emojiData) => {
          setNewPost((prev) => prev + emojiData.emoji);
        }}
      />
    </Suspense>
  </div>
)}

{/* LOCATION */}
{showLocation && (
  <div className="space-y-2">
    <input
      type="text"
      placeholder="Enter location..."
      value={location}
      onChange={(e) =>
        handleLocationSearch(e.target.value)
      }
      className="w-full border p-2 rounded-lg"
    />

    {locationSuggestions.map((item, i) => (
      <div
        key={i}
        onClick={() => {
          setLocation(item);
          setLocationSuggestions([]);
        }}
        className="p-2 border rounded cursor-pointer hover:bg-gray-100"
      >
        {item}
      </div>
    ))}
  </div>
)}

{/* FEELING */}
{showFeeling && (
  <div>
    <input
      type="text"
      placeholder="How are you feeling?"
      value={feeling}
      onChange={(e) =>
        setFeeling(e.target.value)
      }
      className="w-full border p-2 rounded-lg"
    />
  </div>
)}

{/* TAG FRIENDS */}
{showTag && (
  <div>
    <input
      type="text"
      placeholder="Tag friends (comma separated)"
      value={tagInput}
      onChange={(e) =>
        handleTagFriends(e.target.value)
      }
      className="w-full border p-2 rounded-lg"
    />

    {taggedFriends.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-2">
        {taggedFriends.map((friend, i) => (
          <span
            key={i}
            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
          >
            @{friend.trim()}
          </span>
        ))}
      </div>
    )}
  </div>
)}
                <button type="button" onClick={() => setShowEmoji(!showEmoji)}>
                  😊 Emoji
                </button>

                <button type="button" onClick={() => setShowLocation(!showLocation)}>
                  📍 Location
                </button>

                <button type="button" onClick={() => setShowFeeling(!showFeeling)}>
                  😊 Feeling
                </button>

                <button type="button" onClick={() => setShowTag(!showTag)}>
                  🏷 Tag
                </button>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setExpanded(false)}>
                  Cancel
                </button>

                <button type="submit" disabled={posting}>
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
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