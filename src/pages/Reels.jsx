import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "../api/api";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io(API_BASE); // Render backend URL

const Reels = () => {
  const [videos, setVideos] = useState([]);
  const videoRefs = useRef([]);
  const fileRef = useRef();
  const navigate = useNavigate();
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_BASE}/reels`);
      const data = await res.json();
      setVideos(data);

      const initialLikes = {};
      data.forEach(v => initialLikes[v._id] = v.likes?.length || 0);
      setLikes(initialLikes);

      const initialComments = {};
      data.forEach(v => initialComments[v._id] = v.comments || []);
      setComments(initialComments);
    } catch (err) {
      console.error("Fetch reels error:", err);
    }
  };

  // Socket updates
  useEffect(() => {
    socket.on("reel-like", ({ reelId, likesCount }) => {
      setLikes(prev => ({ ...prev, [reelId]: likesCount }));
    });
    socket.on("reel-comment", ({ reelId, comment }) => {
      setComments(prev => ({
        ...prev,
        [reelId]: [...(prev[reelId] || []), comment]
      }));
    });
    socket.on("new-reel", (reel) => {
      setVideos(prev => [reel, ...prev]);
      setLikes(prev => ({ ...prev, [reel._id]: 0 }));
      setComments(prev => ({ ...prev, [reel._id]: [] }));
    });
    return () => {
      socket.off("reel-like");
      socket.off("reel-comment");
      socket.off("new-reel");
    };
  }, []);

  const recordView = async (id) => {
    await fetch(`${API_BASE}/reels/view/${id}`, { method: "POST" });
  };

  const likeVideo = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/reels/${id}/like`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  const uploadReel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/reels/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();
    console.log("Uploaded reel:", data);
  };

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 bg-black text-white p-3 z-50 flex justify-between">
        <h1 className="font-bold text-lg">Reels</h1>
        <button onClick={() => fileRef.current.click()}>Upload</button>
      </div>

      <input type="file" ref={fileRef} className="hidden" onChange={uploadReel} />

      {videos.map((video, i) => (
        <div key={i} className="h-screen snap-start relative">
          <video
            ref={el => (videoRefs.current[i] = el)}
            src={video.media[0].url}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
            onPlay={() => recordView(video._id)}
          />

          <div className="absolute inset-0" onDoubleClick={() => likeVideo(video._id)}>
            {/* User info */}
            <div className="absolute bottom-20 left-4 text-white">
              <div className="flex items-center gap-2 cursor-pointer"
                   onClick={() => navigate(`/profile/${video.user._id}`)}>
                <img src={video.user.profilePic} className="w-10 h-10 rounded-full" />
                <span>{video.user.name}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="absolute right-4 bottom-20 text-white flex flex-col gap-4">
              <button onClick={() => likeVideo(video._id)} className="text-2xl">
                ❤️ <div className="text-sm">{likes[video._id] || 0}</div>
              </button>
              <button className="text-2xl">💬 <div className="text-sm">{comments[video._id]?.length || 0}</div></button>
              <button className="text-2xl">🔗</button>
            </div>
          </div>
        </div>
      ))}

    </div>
  );
};

export default Reels;