import React, { useEffect, useRef, useState } from "react";
import PostCard from "../components/PostCard";
import SidebarLeft from "../components/layout/SidebarLeft";
import SidebarRight from "../components/layout/SidebarRight";
import StoriesBar from "../components/layout/StoriesBar";
import StoryViewer from "../components/stories/StoryViewer";
import MediaUpload from "../components/MediaUpload";
import imageCompression from "browser-image-compression";
import { API_BASE, fetchWithToken } from "../api/api";
import { getSocket, connectSocket } from "../socket";
import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";
import EmojiPicker from "emoji-picker-react";

/* ================= STORIES HOOK ================= */
const useStories = () => {
  const [stories, setStories] = useState([]);
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await fetch(`${API_BASE}/api/stories`);
        const res = await data.json();
        setStories(res || []);
      } catch (err) {
        console.error("Stories fetch error:", err);
      }
    };
    fetchStories();
  }, []);
  return stories;
};

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

  const stories = useStories();
  const [activeStory, setActiveStory] = useState(null);

  const feedRef = useRef();
  const { uploadImage } = useCloudinaryUpload();
  const { uploadVideo } = useR2Upload();

  useEffect(() => connectSocket(), []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on("new-video", (post) => setPosts((prev) => [post, ...prev]));
    socket.on("new-story", () => console.log("New story received"));
    return () => socket.off("new-video");
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await fetchWithToken(`${API_BASE}/api/posts`, token);
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [token]);

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost && mediaFiles.length === 0) return;
    setPosting(true);

    try {
      const uploadedMedia = [];
      for (let i = 0; i < mediaFiles.length; i++) {
        let file = mediaFiles[i];
        if (file.type.startsWith("image")) {
          file = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1280 });
        }
        const url = file.type.startsWith("image") ? await uploadImage(file) : await uploadVideo(file);
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
    <>
      {activeStory && (
        <StoryViewer stories={stories} index={stories.findIndex(s => s._id === activeStory._id)} onClose={() => setActiveStory(null)} />
      )}

      <div className="max-w-7xl mx-auto px-2 md:px-6 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="hidden md:block"><SidebarLeft /></div>

        <div className="md:col-span-2 space-y-4">
          <StoriesBar user={{ _id: currentUserId }} posts={stories} onStoryClick={setActiveStory} />

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
              {showEmoji && <EmojiPicker onEmojiClick={(e) => setNewPost(prev => prev + e.emoji)} />}
              <MediaUpload mediaFiles={mediaFiles} setMediaFiles={setMediaFiles} />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">{posting ? "Posting..." : "Post"}</button>
            </>}
          </form>

          <div ref={feedRef} className="space-y-4">
            {loadingPosts ? [<div key={1} className="h-64 bg-gray-300 rounded-xl animate-pulse" />, <div key={2} className="h-64 bg-gray-300 rounded-xl animate-pulse" />]
              : posts.map(post => <PostCard key={post._id} post={post} currentUserId={currentUserId} onLike={() => {}} onComment={() => {}} onShare={() => {}} />)
            }
          </div>
        </div>

        <div className="hidden md:block"><SidebarRight /></div>
      </div>
    </>
  );
};

export default Home;