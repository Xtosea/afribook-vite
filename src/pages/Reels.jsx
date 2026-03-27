import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "../api/api";
import { useNavigate } from "react-router-dom";

const Reels = () => {
  const [videos, setVideos] = useState([]);
  const videoRefs = useRef([]);
  const navigate = useNavigate();
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const fileRef = useRef();

  useEffect(() => { fetchReels(); }, []);

  // ================== FETCH REELS ==================
  const fetchReels = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reels`);
      const data = await res.json();
      setVideos(data);

      const initialLikes = {};
      const initialComments = {};
      data.forEach(v => {
        initialLikes[v._id] = v.likes?.length || 0;
        initialComments[v._id] = v.comments || [];
      });
      setLikes(initialLikes);
      setComments(initialComments);
    } catch (err) { console.error(err); }
  };

  // ================== LIKE ==================
  const likeVideo = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/posts/${id}/like`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLikes(prev => ({ ...prev, [id]: data.likesCount }));
    } catch (err) { console.error(err); }
  };

  // ================== RECORD VIEW ==================
  const recordView = async (id) => {
    await fetch(`${API_BASE}/api/reels/view/${id}`, { method: "POST" });
  };

  // ================== COMMENT ==================
  const addComment = async (id) => {
    const text = prompt("Enter comment:");
    if (!text) return;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/api/reels/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setComments(prev => ({
        ...prev,
        [id]: [...(prev[id] || []), data.comment],
      }));
    } catch (err) { console.error(err); }
  };

  // ================== SHARE ==================
  const shareReel = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/reels/${id}/share`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      alert(`Reel shared! Total shares: ${data.shares}`);
    } catch (err) { console.error(err); }
  };

  // ================== AUTO PLAY ==================
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play();
          recordView(video.dataset.id);
        } else video.pause();
      }),
      { threshold: 0.7 }
    );
    videoRefs.current.forEach(video => video && observer.observe(video));
    return () => videoRefs.current.forEach(video => video && observer.unobserve(video));
  }, [videos]);

  // ================== UPLOAD REEL ==================
  const uploadReel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const caption = prompt("Enter reel caption") || "";
    const formData = new FormData();
    formData.append("video", file);
    formData.append("caption", caption);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE}/api/reels/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setVideos(prev => [data, ...prev]);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black relative">

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 bg-black text-white p-3 z-50 flex justify-between">
        <h1 className="font-bold text-lg">Reels</h1>
        <button onClick={() => fileRef.current.click()}>Upload</button>
        <input type="file" ref={fileRef} onChange={uploadReel} hidden />
      </div>

      {/* Reels feed */}
      {videos.map((video, i) => (
        <div key={i} className="h-screen snap-start relative">
          <video
            ref={el => (videoRefs.current[i] = el)}
            data-id={video._id}
            src={video.media[0].url}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
          />

          {/* User info */}
          <div className="absolute bottom-32 left-4 text-white">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate(`/profile/${video.user._id}`)}
            >
              <img src={video.user.profilePic} className="w-10 h-10 rounded-full" />
              <span>{video.user.name}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="absolute right-4 bottom-32 text-white flex flex-col gap-4">
            <button onClick={() => likeVideo(video._id)} className="text-2xl">
              ❤️<div className="text-sm">{likes[video._id] || 0}</div>
            </button>
            <button onClick={() => addComment(video._id)} className="text-2xl">💬</button>
            <button onClick={() => shareReel(video._id)} className="text-2xl">🔗</button>
          </div>

          {/* Comments */}
          <div className="absolute bottom-4 left-4 right-4 text-white flex flex-col gap-2 max-h-32 overflow-y-auto">
            {(comments[video._id] || []).map((c, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-bold">{c.user.name}:</span> {c.text}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Reels;