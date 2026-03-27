// src/pages/MediaViewer.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API_BASE } from "../api/api"; // Make sure this points to your backend
import PostCard from "../components/PostCard";

const MediaViewer = () => {
  const { postId } = useParams();
  const [searchParams] = useSearchParams();
  const initialIndex = parseInt(searchParams.get("index")) || 0;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoRefs, setVideoRefs] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/posts/${postId}`); // Ensure correct backend URL
        if (!res.ok) throw new Error("Post not found");
        const data = await res.json();
        setPost(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) return <p className="text-center mt-10">Loading post...</p>;
  if (!post) return <p className="text-center mt-10">Post not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <button
        className="mb-4 text-blue-500 underline"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="max-w-4xl mx-auto space-y-4">
        <PostCard
          post={post}
          setVideoRefs={setVideoRefs}
          onLike={(postId, reaction) => {
            console.log("Liked:", postId, reaction);
            // TODO: call your backend like API
          }}
          onComment={(postId, text) => {
            console.log("Comment:", postId, text);
            // TODO: call your backend comment API
          }}
          onShare={(post) => {
            console.log("Share post:", post._id);
            // TODO: implement share logic
          }}
        />
      </div>

      {/* Scrollable Media Preview */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">All Media</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {post.media.map((m, i) => (
            <div
              key={i}
              className="relative h-48 md:h-56 overflow-hidden rounded-xl cursor-pointer bg-black"
              onClick={() => navigate(`/media/${post._id}?index=${i}`)}
            >
              {m.type === "image" ? (
                <img
                  src={m.url}
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <video
                  data-src={m.url}
                  ref={(el) => (videoRefs[i] = el)}
                  className="w-full h-full object-cover"
                  muted
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;