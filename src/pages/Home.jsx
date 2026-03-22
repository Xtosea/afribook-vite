import React, { useEffect, useState, useRef, useCallback } from "react";
import { API_BASE, fetchWithToken } from "../api/api";
import PostCard from "../components/PostCard";
import { FiUpload } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";

const generateVideoThumbnail = (file) =>
  new Promise((resolve) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.currentTime = 1;
    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7);
    };
  });

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
  const [uploadProgress, setUploadProgress] = useState({});

  const fileInputRef = useRef();
  const { uploadImage } = useCloudinaryUpload();
  const { uploadVideo } = useR2Upload();
  const videoRefs = useRef([]);

  /* ================= FETCH POSTS ================= */
  const fetchPosts = async () => {
    if (!token) return;
    try {
      const data = await fetchWithToken(`${API_BASE}/api/posts`, token);
      const fixedPosts = data.map((post) => ({
        ...post,
        media: post.media?.map((m) => ({
          ...m,
          url: m.url.startsWith("http") ? m.url : `${API_BASE}${m.url}`,
          thumbnail:
            m.thumbnail && !m.thumbnail.startsWith("http")
              ? `${API_BASE}${m.thumbnail}`
              : m.thumbnail,
        })),
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
    setMediaFiles((prev) => [...prev, ...files]);
  };

  const removeMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= SUBMIT POST ================= */
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (posting) return;
    if (!newPost.trim() && mediaFiles.length === 0) return;

    setPosting(true);
    setUploadProgress({});

    try {
      const uploadedMedia = [];

      for (const file of mediaFiles) {
        let url = null;
        let thumbnail = null;

        if (file.type.startsWith("image")) {
          url = await uploadImage(file, (p) =>
            setUploadProgress((prev) => ({ ...prev, [file.name]: p }))
          );
        } else if (file.type.startsWith("video")) {
          const thumbBlob = await generateVideoThumbnail(file);
          url = await uploadVideo(file, (p) =>
            setUploadProgress((prev) => ({ ...prev, [file.name]: p }))
          );
          thumbnail = await uploadImage(thumbBlob);
        }

        if (url) {
          uploadedMedia.push({
            url,
            type: file.type.startsWith("image") ? "image" : "video",
            thumbnail,
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
          feeling,
          location,
          taggedFriends,
          media: uploadedMedia,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPosts((prev) => [data.post, ...prev]);
      setNewPost("");
      setMediaFiles([]);
      setLocation("");
      setFeeling("");
      setTaggedFriends([]);
      setExpanded(false);
      setUploadProgress({});
      fileInputRef.current.value = null;
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Upload failed");
    } finally {
      setPosting(false);
    }
  };

  /* ================= LIKE, COMMENT, SHARE ================= */
  const handleLike = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              likes: p.likes?.includes(currentUserId)
                ? p.likes.filter((id) => id !== currentUserId)
                : [...(p.likes || []), currentUserId],
            }
          : p
      )
    );
  };

  const handleComment = (postId, text) => {
    setPosts((prev) =>
      prev.map((p) =>
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

  /* ================= VIDEO AUTO PLAY / LAZY ================= */
  const handleScroll = useCallback(() => {
    if (!videoRefs.current.length) return;

    videoRefs.current.forEach((vid) => {
      if (!vid) return;
      const rect = vid.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [posts, handleScroll]);

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
            <div className="flex flex-wrap gap-2 mb-2">
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

              <button type="button" onClick={() => setShowEmoji((p) => !p)} className="px-3 py-1 border rounded-full text-sm">
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

              <input
                type="text"
                placeholder="Tag friends"
                value={taggedFriends.join(", ")}
                onChange={(e) => setTaggedFriends(e.target.value.split(",").map((f) => f.trim()))}
                className="px-3 py-1 border rounded-full text-sm"
              />
            </div>

            {showEmoji && (
              <EmojiPicker onEmojiClick={(e) => setNewPost((prev) => prev + e.emoji)} />
            )}

            {mediaFiles.length > 0 && (
              <div className="flex gap-3 overflow-x-auto mb-2">
                {mediaFiles.map((file, i) => (
                  <div key={i} className="relative w-24 h-24 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => removeMedia(i)}
                      className="absolute top-0 right-0 bg-black text-white rounded-full px-1 text-xs z-10"
                    >
                      ✕
                    </button>
                    {file.type.startsWith("image") ? (
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded" />
                    ) : (
                      <video src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded" controls />
                    )}
                    {uploadProgress[file.name] && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
                        <div className="h-1 bg-blue-500" style={{ width: `${uploadProgress[file.name]}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={posting} className="px-6 py-2 bg-blue-600 text-white rounded-full">
              {posting ? "Posting..." : "Post"}
            </button>
          </>
        )}
      </form>

      {/* POSTS */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts yet</p>
      ) : (
        posts.map((post, idx) => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={currentUserId}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            videoRef={(el) => (videoRefs.current[idx] = el)}
          />
        ))
      )}
    </div>
  );
};

export default Home;