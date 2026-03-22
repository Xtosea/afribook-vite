import React, { useEffect, useState, useRef } from "react";
import { API_BASE, fetchWithToken } from "../api/api";
import PostCard from "../components/PostCard";
import { FiUpload } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";

// ...imports stay the same
const R2_CUSTOM_DOMAIN = import.meta.env.VITE_R2_CUSTOM_DOMAIN;

const Home = () => {
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [location, setLocation] = useState("");
  const [feeling, setFeeling] = useState("");
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef();
  const { uploadImage } = useCloudinaryUpload();
  const { uploadVideo } = useR2Upload();

  const fetchPosts = async () => {
    try {
      const data = await fetch(`${API_BASE}/api/posts`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + mediaFiles.length > 5) {
      alert("Max 5 files allowed");
      return;
    }
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMedia = (index) => setMediaFiles(prev => prev.filter((_, i) => i !== index));

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (posting) return;
    if (!newPost.trim() && mediaFiles.length === 0) return;

    setPosting(true);
    const uploadedMedia = [];

    try {
      for (const file of mediaFiles) {
        let url = null;
        if (file.type.startsWith("image")) url = await uploadImage(file, setUploadProgress);
        else if (file.type.startsWith("video")) url = await uploadVideo(file, setUploadProgress);

        if (url) uploadedMedia.push({ url, type: file.type.startsWith("image") ? "image" : "video" });
      }

      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newPost,
          feeling,
          location,
          taggedFriends,
          media: uploadedMedia,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPosts(prev => [data.post, ...prev]);
      setNewPost(""); setMediaFiles([]); setLocation(""); setFeeling(""); setTaggedFriends([]);
      setExpanded(false); setUploadProgress(0); fileInputRef.current.value = null;

    } catch (err) {
      console.error("Post creation error:", err);
      alert("Upload failed");
    } finally { setPosting(false); }
  };

  return (
    <div className="container mx-auto py-6 max-w-2xl space-y-6">
      {/* ...your form JSX here (same as before, just ensure multiple file input name="video") */}
      {/* Display posts */}
      {posts.map(post => (
        <PostCard key={post._id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  );
};

export default Home;e;