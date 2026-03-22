import React, { useEffect, useState, useRef } from "react";
import { API_BASE } from "../api/api";
import PostCard from "../components/PostCard";
import { FiUpload } from "react-icons/fi";
import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";

const Home = () => {
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [posting, setPosting] = useState(false);

  const fileInputRef = useRef();
  const { uploadImage } = useCloudinaryUpload();
  const { uploadVideo } = useR2Upload();

  /* ================= FETCH POSTS ================= */
  const fetchPosts = async () => {
    try {
      console.log("Fetching posts...");

      const res = await fetch(`${API_BASE}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      console.log("POSTS RESPONSE:", data);

      if (!res.ok) throw new Error("Failed to fetch posts");

      setPosts(data);
    } catch (err) {
      console.error("FETCH POSTS ERROR:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  /* ================= MEDIA ================= */
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles((prev) => [...prev, ...files]);
  };

  /* ================= CREATE POST ================= */
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (posting) return;

    setPosting(true);

    try {
      const uploadedMedia = [];

      for (const file of mediaFiles) {
        let url = null;

        if (file.type.startsWith("image")) {
          url = await uploadImage(file);
        } else if (file.type.startsWith("video")) {
          url = await uploadVideo(file);
        }

        if (url) {
          uploadedMedia.push({
            url,
            type: file.type.startsWith("image") ? "image" : "video",
          });
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

      if (!res.ok) throw new Error(data.error);

      setPosts((prev) => [data.post, ...prev]);

      setNewPost("");
      setMediaFiles([]);
      fileInputRef.current.value = null;

    } catch (err) {
      console.error("POST ERROR:", err);
    } finally {
      setPosting(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container mx-auto py-6 max-w-2xl space-y-6">

      {/* CREATE POST */}
      <form onSubmit={handleSubmitPost} className="bg-white p-4 rounded shadow space-y-3">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border p-2 rounded"
        />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleMediaChange}
        />

        <button
          type="submit"
          disabled={posting}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {posting ? "Posting..." : "Post"}
        </button>
      </form>

      {/* POSTS */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts yet</p>
      ) : (
        posts.map((post) => (
          <PostCard key={post._id} post={post} currentUserId={currentUserId} />
        ))
      )}
    </div>
  );
};

export default Home;