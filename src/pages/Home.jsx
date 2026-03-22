import React, { useEffect, useState, useRef } from "react";
import { API_BASE, fetchWithToken } from "../api/api";
import PostCard from "../components/PostCard";
import { FiUpload } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";

const R2_CUSTOM_DOMAIN = "https://media.africbook.globelynks.com";

const Home = () => {
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [location, setLocation] = useState("");
  const [feeling, setFeeling] = useState("");
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef();
  const { uploadImage } = useCloudinaryUpload();
  const { uploadVideo } = useR2Upload();

  /* ================= FETCH POSTS ================= */
  const fetchPosts = async () => {
    if (!token) return;

    try {
      const data = await fetchWithToken(`${API_BASE}/api/posts`, token);

      const fixedPosts = data.map(post => ({
        ...post,
        media: post.media?.map(m => {
          // Use Cloudinary for images, R2 custom domain for videos
          if (m.type === "image") {
            return {
              ...m,
              url: m.url.startsWith("http") ? m.url : `${API_BASE}${m.url}`,
            };
          } else if (m.type === "video") {
            // Ensure R2_CUSTOM_DOMAIN is used
            const filename = m.url.split("/").pop();
            return {
              ...m,
              url: `${R2_CUSTOM_DOMAIN}/${filename}`,
            };
          }
          return m;
        }),
        user: {
          ...post.user,
          profilePic: post.user?.profilePic
            ? post.user.profilePic.startsWith("http")
              ? post.user.profilePic
              : `${API_BASE}${post.user.profilePic}`
            : `${API_BASE}/uploads/profiles/default-profile.png`,
        },
      }));

      setPosts(fixedPosts);
    } catch (err) {
      console.error("FETCH POSTS ERROR:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  /* ================= MEDIA HANDLERS ================= */
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + mediaFiles.length > 5) {
      alert("Max 5 media files allowed");
      return;
    }

    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  /* ================= SUBMIT POST ================= */
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (posting) return;
    if (!newPost.trim() && mediaFiles.length === 0) return;

    setPosting(true);
    setUploadProgress(0);

    try {
      const uploadedMedia = [];

      for (const file of mediaFiles) {
        let url = null;

        if (file.type.startsWith("image")) {
          url = await uploadImage(file, (progress) => setUploadProgress(progress));
        } else if (file.type.startsWith("video")) {
          url = await uploadVideo(file, (progress) => setUploadProgress(progress));
        }

        if (url) {
          uploadedMedia.push({
            url,
            type: file.type.startsWith("image") ? "image" : "video",
          });
        }
      }

      // Send post to backend
      const formData = new FormData();
      formData.append("content", newPost);
      formData.append("feeling", feeling);
      formData.append("location", location);
      formData.append("taggedFriends", JSON.stringify(taggedFriends));
      uploadedMedia.forEach(m => formData.append("media", JSON.stringify(m)));

      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPosts(prev => [data.post, ...prev]);

      // Reset
      setNewPost("");
      setMediaFiles([]);
      setLocation("");
      setFeeling("");
      setTaggedFriends([]);
      setExpanded(false);
      setUploadProgress(0);
      fileInputRef.current.value = null;

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Upload failed");
    } finally {
      setPosting(false);
    }
  };

  /* ================= UI ACTIONS ================= */
  const handleLike = (postId) => {
    setPosts(prev =>
      prev.map(p =>
        p._id === postId
          ? {
              ...p,
              likes: p.likes?.includes(currentUserId)
                ? p.likes.filter(id => id !== currentUserId)
                : [...(p.likes || []), currentUserId],
            }
          : p
      )
    );
  };

  const handleComment = (postId, text) => {
    setPosts(prev =>
      prev.map(p =>
        p._id === postId
          ? {
              ...p,
              comments: [...(p.comments || []), { _id: Date.now(), text, user: { name: "You" } }],
            }
          : p
      )
    );
  };

  const handleShare = (post) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
    alert("Link copied!");
  };

  /* ================= UI ================= */
  return (
    <div className="container mx-auto py-6 max-w-2xl space-y-6">

      {/* CREATE POST */}
      <form onSubmit={handleSubmitPost} className="bg-white p-4 rounded-xl shadow space-y-3">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="What's on your mind?"
          className="w-full border rounded-lg p-3 resize-none"
          rows={expanded ? 4 : 2}
        />

        {expanded && (
          <>
            {showEmoji && (
              <EmojiPicker
                onEmojiClick={(e) => {
                  setNewPost(prev => prev + e.emoji);
                  setShowEmoji(false);
                }}
              />
            )}

            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-1 cursor-pointer px-3 py-1 border rounded-full text-sm">
                <FiUpload /> Media
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="hidden"
                />
              </label>

              <button type="button" onClick={() => setShowEmoji(prev => !prev)} className="px-3 py-1 border rounded-full text-sm">
                😊 Emoji
              </button>

              <input
                type="text"
                placeholder="Feeling"
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                className="px-3 py-1 border rounded-full text-sm"
              />

              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="px-3 py-1 border rounded-full text-sm"
              />
            </div>

            <input
              type="text"
              placeholder="Tag friends"
              value={taggedFriends.join(", ")}
              onChange={(e) => setTaggedFriends(e.target.value.split(",").map(f => f.trim()))}
              className="border rounded-lg px-3 py-2 w-full text-sm"
            />

            {mediaFiles.length > 0 && (
              <div className="flex gap-3 overflow-x-auto">
                {mediaFiles.map((file, i) => (
                  <div key={i} className="relative">
                    <button type="button" onClick={() => removeMedia(i)} className="absolute top-0 right-0 bg-black text-white rounded-full px-2 text-xs">✕</button>
                    {file.type.startsWith("image") ? (
                      <img src={URL.createObjectURL(file)} className="w-24 h-24 rounded object-contain bg-gray-100" />
                    ) : (
                      <video src={URL.createObjectURL(file)} className="w-24 h-24 rounded object-contain bg-gray-100" controls />
                    )}
                  </div>
                ))}
              </div>
            )}

            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 h-2 rounded">
                <div className="bg-blue-500 h-2 rounded" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}

            <button type="submit" disabled={posting} className="px-6 py-2 bg-blue-600 text-white rounded-full">
              {posting ? "Posting..." : "Post"}
            </button>
          </>
        )}
      </form>

      {/* POSTS */}
      {posts.map(post => (
        <PostCard
          key={post._id}
          post={post}
          currentUserId={currentUserId}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
        />
      ))}

    </div>
  );
};

export default Home;