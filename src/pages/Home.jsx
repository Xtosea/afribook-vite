import React, { useEffect, useState, useRef } from "react";
import { API_BASE } from "../api/api";
import PostCard from "../components/PostCard";
import { FiUpload } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import { useCloudinaryUpload } from "../hooks/useCloudinaryUpload";
import { useR2Upload } from "../hooks/useR2Upload";

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

      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg", 0.7);
    };
  });
};

const Home = () => {
  const token = localStorage.getItem("token");

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const fileInputRef = useRef();
  const { uploadImage } = useCloudinaryUpload();
  const { uploadVideo } = useR2Upload();

  /* ================= FETCH POSTS ================= */
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= MEDIA ================= */
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles((prev) => [...prev, ...files]);
  };

  const removeMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
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
        let thumbnail = null;

        if (file.type.startsWith("image")) {
          url = await uploadImage(file, (p) =>
            setUploadProgress((prev) => ({ ...prev, [file.name]: p }))
          );
        }

        if (file.type.startsWith("video")) {
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
          media: uploadedMedia,
        }),
      });

      const data = await res.json();

      setPosts((prev) => [data.post, ...prev]);

      setNewPost("");
      setMediaFiles([]);
      setUploadProgress({});
      fileInputRef.current.value = null;

    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container mx-auto py-6 max-w-2xl space-y-6">

      {/* CREATE POST */}
      <form onSubmit={handleSubmitPost} className="bg-white p-4 rounded shadow">

        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="What's on your mind?"
          className="w-full border p-2 rounded"
        />

        {expanded && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleMediaChange}
            />

            {mediaFiles.map((file, i) => (
              <div key={i}>
                {file.name}
                {uploadProgress[file.name] && (
                  <div>{uploadProgress[file.name]}%</div>
                )}
              </div>
            ))}

            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              {posting ? "Posting..." : "Post"}
            </button>
          </>
        )}
      </form>

      {/* POSTS */}
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Home;