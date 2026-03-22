import React, { useEffect, useRef, useState } from "react";
import { API_BASE, fetchWithToken } from "../api/api";
import PostCard from "../components/PostCard";
import { FiUpload } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";
import { useNavigate } from "react-router-dom";

// Utility: Generate video thumbnail
const generateVideoThumbnail = (file) => {
  return new Promise((resolve) => {
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
};

// Intersection Observer hook for lazy loading videos
const useLazyVideo = (ref) => {
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        });
      },
      { threshold: 0.5 }
    );
    const videos = ref.current.querySelectorAll("video");
    videos.forEach((v) => observer.observe(v));
    return () => videos.forEach((v) => observer.unobserve(v));
  }, [ref]);
};

const Home = () => {
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const navigate = useNavigate();

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

  const [modal, setModal] = useState({ open: false, postIndex: null, mediaIndex: 0 });
  const fileInputRef = useRef();
  const feedRef = useRef();
  const videoRefs = useRef([]);

  const { uploadImage } = useCloudinaryUpload();
  const { uploadVideo } = useR2Upload();

  useLazyVideo(feedRef);

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
        })),
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

  /* ================= CREATE POST ================= */
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (posting || (!newPost.trim() && mediaFiles.length === 0)) return;

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
        if (url)
          uploadedMedia.push({
            url,
            type: file.type.startsWith("image") ? "image" : "video",
            thumbnail,
            isReel: file.type.startsWith("video") && mediaFiles.length === 1,
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
      if (!res.ok) throw new Error(data.error);

      setPosts((prev) => [data.post, ...prev]);

      // reset form
      setNewPost("");
      setMediaFiles([]);
      setLocation("");
      setFeeling("");
      setTaggedFriends([]);
      setUploadProgress({});
      setExpanded(false);
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Upload failed");
    } finally {
      setPosting(false);
    }
  };

  /* ================= UI ACTIONS ================= */
  const handleLike = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              likes: p.likes?.includes(currentUserId)
                ? p.likes.filter((id) => id !== currentUserId)
                : [...(p.likes || []), currentUserId],
              likedAnimation: true,
            }
          : p
      )
    );
    setTimeout(() => {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likedAnimation: false } : p))
      );
    }, 800);
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

  /* ================= MODAL HANDLERS ================= */
  const openModal = (postIndex, mediaIndex = 0) =>
    setModal({ open: true, postIndex, mediaIndex });
  const closeModal = () => setModal({ open: false, postIndex: null, mediaIndex: 0 });
  const prevMedia = () => {
    setModal((prev) => {
      const total = posts[prev.postIndex].media.length;
      return { ...prev, mediaIndex: (prev.mediaIndex - 1 + total) % total };
    });
  };
  const nextMedia = () => {
    setModal((prev) => {
      const total = posts[prev.postIndex].media.length;
      return { ...prev, mediaIndex: (prev.mediaIndex + 1) % total };
    });
  };

  /* ================= SWIPE SUPPORT ================= */
  const swipeStartX = useRef(0);
  const handleTouchStart = (e) => { swipeStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientX - swipeStartX.current;
    if (diff > 50) prevMedia();
    else if (diff < -50) nextMedia();
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

              <input type="text" placeholder="Feeling" value={feeling} onChange={(e) => setFeeling(e.target.value)} className="px-3 py-1 border rounded-full text-sm" />
              <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="px-3 py-1 border rounded-full text-sm" />
              <input type="text" placeholder="Tag friends" value={taggedFriends.join(", ")} onChange={(e) => setTaggedFriends(e.target.value.split(",").map((f) => f.trim()))} className="px-3 py-1 border rounded-full text-sm" />
            </div>

            {showEmoji && <EmojiPicker onEmojiClick={(e) => setNewPost((prev) => prev + e.emoji)} />}

            {mediaFiles.length > 0 && (
              <div className="flex gap-3 overflow-x-auto mb-2">
                {mediaFiles.map((file, i) => (
                  <div key={i} className="relative w-24 h-24 flex-shrink-0">
                    <button type="button" onClick={() => removeMedia(i)} className="absolute top-0 right-0 bg-black text-white rounded-full px-1 text-xs z-10">✕</button>
                    {file.type.startsWith("image") ? (
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded" />
                    ) : (
                      <>
                        <video src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded" controls />
                        {mediaFiles.length === 1 && <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">Reel</span>}
                      </>
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

            <div className="flex gap-2">
              <button type="submit" disabled={posting} className="px-6 py-2 bg-blue-600 text-white rounded-full">{posting ? "Posting..." : "Post"}</button>
              <button type="button" onClick={() => { setExpanded(false); setNewPost(""); setMediaFiles([]); setLocation(""); setFeeling(""); setTaggedFriends([]); setUploadProgress({}); if (fileInputRef.current) fileInputRef.current.value = null; }} className="px-6 py-2 bg-gray-300 text-black rounded-full">Cancel</button>
            </div>
          </>
        )}
      </form>

      {/* POSTS FEED */}
      <div ref={feedRef} className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts yet</p>
        ) : (
          posts.map((post, idx) =>
            post.media?.some((m) => m.type === "video" && m.isReel) ? (
              post.media
                .filter((m) => m.type === "video" && m.isReel)
                .map((m, i) => (
                  <div key={i} className="h-screen w-full snap-start relative">
                    <video
                      ref={(el) => (videoRefs.current[idx * 10 + i] = el)}
                      src={m.url}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                      onClick={() => handleLike(post._id)}
                    />
                    <div className="absolute bottom-6 left-4 text-white">
                      <p className="text-sm opacity-80">Tap video ❤️ to like</p>
                    </div>
                  </div>
                ))
            ) : (
              <PostCard key={post._id} post={post} currentUserId={currentUserId} onLike={handleLike} onComment={handleComment} onShare={handleShare} openModal={openModal} />
            )
          )
        )}
      </div>

      {/* MEDIA MODAL */}
      {modal.open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={(e) => { e.stopPropagation(); prevMedia(); }}
            className="absolute left-2 text-white text-2xl font-bold"
          >◀</button>
          <button
            onClick={(e) => { e.stopPropagation(); nextMedia(); }}
            className="absolute right-2 text-white text-2xl font-bold"
          >▶</button>

          <div className="flex max-w-full max-h-full overflow-x-hidden relative" onClick={(e) => e.stopPropagation()}>
            {posts[modal.postIndex].media.map((m, i) => (
              <div key={i} className="flex-shrink-0 w-full h-full flex items-center justify-center transition-transform duration-300" style={{ transform: `translateX(-${modal.mediaIndex * 100}%)` }}>
                {m.type === "image" ? (
                  <img src={m.url} className="max-h-full max-w-full rounded" />
                ) : (
                  <video key={m.url} src={m.url} controls autoPlay={i === modal.mediaIndex} muted className="max-h-full max-w-full rounded" />
                )}
                {m.isReel && <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-1 rounded">Reel</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;