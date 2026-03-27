import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "../api/api";
import { useNavigate } from "react-router-dom";
import ReelUpload from "../components/reels/ReelUpload";

const Reels = () => {
  const [videos, setVideos] = useState([]);
  const videoRefs = useRef([]);
  const navigate = useNavigate();
  const [likes, setLikes] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [activePost, setActivePost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/posts`);
      const data = await res.json();

      // Only real videos (non-empty URLs)
      const vids = data.flatMap((post) =>
        post.media
          ?.filter((m) => m.type === "video" && m.url && m.url.trim() !== "")
          .map((m) => ({
            ...m,
            postId: post._id,
            user: post.user,
            likes: post.likes?.length || 0,
          })) || []
      );

      setVideos(vids);

      const initialLikes = {};
      vids.forEach((v) => {
        initialLikes[v.postId] = v.likes;
      });
      setLikes(initialLikes);
    } catch (err) {
      console.error(err);
    }
  };

  const likeVideo = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/posts/like/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLikes((prev) => ({ ...prev, [id]: data.likes }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const submitComment = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_BASE}/api/posts/comment/${activePost}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText }),
      });
      setCommentText("");
      fetchComments(activePost);
    } catch (err) {
      console.error(err);
    }
  };

  const sharePost = (id) => {
    const link = `${window.location.origin}/post/${id}`;
    navigator.clipboard.writeText(link);
    alert("Link copied!");
  };

  // Auto-play videos
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          entry.isIntersecting ? video.play() : video.pause();
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, [videos]);

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black scroll-smooth relative">

      {/* Floating Upload Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Upload Modal */}
        {showUpload && (
          <ReelUpload
            onClose={() => setShowUpload(false)}
            className="animate-slideUp"
          />
        )}

        <button
          onClick={() => setShowUpload(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-lg text-sm font-semibold"
        >
          + Upload Reel
        </button>
      </div>

      {videos.map((video, i) => (
        // Only render if URL exists
        video.url && video.url.trim() !== "" && (
          <div key={i} className="h-screen snap-start relative">
            <video
              ref={(el) => (videoRefs.current[i] = el)}
              src={video.url}
              className="h-full w-full object-cover"
              loop
              muted
              playsInline
            />

            {/* Double Tap Area */}
            <div
              className="absolute inset-0"
              onDoubleClick={() => likeVideo(video.postId)}
            >
              {/* User */}
              <div className="absolute bottom-20 left-4 text-white">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => navigate(`/profile/${video.user._id}`)}
                >
                  <img
                    src={video.user?.profilePic}
                    className="w-10 h-10 rounded-full"
                  />
                  <span>{video.user?.name}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute right-4 bottom-20 text-white flex flex-col gap-5">
                <button
                  onClick={() => likeVideo(video.postId)}
                  className="text-3xl"
                >
                  ❤️
                  <div className="text-sm text-center">
                    {likes[video.postId] || 0}
                  </div>
                </button>
                <button
                  className="text-3xl"
                  onClick={() => {
                    setActivePost(video.postId);
                    setShowComments(true);
                    fetchComments(video.postId);
                  }}
                >
                  💬
                </button>
                <button
                  className="text-3xl"
                  onClick={() => sharePost(video.postId)}
                >
                  🔗
                </button>
              </div>
            </div>
          </div>
        )
      ))}

      {/* Comments Panel */}
      {showComments && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full h-[70%] rounded-t-2xl p-4 overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-lg">Comments</h2>
              <button onClick={() => setShowComments(false)}>✖</button>
            </div>

            {comments.map((c) => (
              <div key={c._id} className="flex gap-2 mb-3">
                <img
                  src={c.user?.profilePic}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="font-semibold text-sm">{c.user?.name}</div>
                  <div className="text-sm">{c.text}</div>
                </div>
              </div>
            ))}

            <div className="flex gap-2 mt-4">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write comment..."
                className="border flex-1 p-2 rounded-full"
              />
              <button
                onClick={submitComment}
                className="bg-blue-600 text-white px-4 rounded-full"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reels;