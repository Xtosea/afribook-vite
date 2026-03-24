// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import { fetchWithToken, API_BASE } from "../api/api";
import { getSocket } from "../socket";

import ProfileHeader from "../components/profile/ProfileHeader";
import UserInfoCard from "../components/profile/UserInfoCard";
import ProfileTabs from "../components/profile/ProfileTabs";
import EditProfileModal from "../components/profile/EditProfileModal";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const finalUserId = userId || currentUserId;

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("Posts");

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    intro: "",
    dob: "",
    phone: "",
    education: "",
    origin: "",
    maritalStatus: "",
    email: "",
    profilePic: null,
    coverPhoto: null,
  });

  const [previewProfilePic, setPreviewProfilePic] = useState(null);
  const [previewCoverPhoto, setPreviewCoverPhoto] = useState(null);

  /* ================= SAFE FETCH HELPER ================= */
  const safeFetch = async (url) => {
    try {
      const data = await fetchWithToken(url, token);
      if (data && typeof data === "object") return data;
      console.warn("Unexpected response format:", data);
      return null;
    } catch (err) {
      console.error("Fetch error:", err);
      return null;
    }
  };

  /* ================= FETCH PROFILE & POSTS ================= */
  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchProfile = async () => {
      setLoadingPosts(true);

      const userData = await safeFetch(`${API_BASE}/api/users/${finalUserId}`);
      if (!userData) return navigate("/login");

      setUser(userData);
      setPreviewProfilePic(userData.profilePic || null);
      setPreviewCoverPhoto(userData.coverPhoto || null);

      const followerIds = (userData.followers || []).map(f => f._id || f);
      setIsFollowing(followerIds.includes(currentUserId));

      const postsData = await safeFetch(`${API_BASE}/api/posts/user/${finalUserId}`) || [];
      const fixedPosts = postsData.map(post => ({
        ...post,
        media: post.media?.map(m => ({
          ...m,
          url: m.url.startsWith("http") ? m.url : `${API_BASE}${m.url}`,
        })),
        likes: post.likes || [],
        comments: post.comments || [],
      }));
      setPosts(fixedPosts);

      setFormData({
        name: userData.name || "",
        bio: userData.bio || "",
        intro: userData.intro || "",
        dob: userData.dob || "",
        phone: userData.phone || "",
        education: userData.education || "",
        origin: userData.origin || "",
        maritalStatus: userData.maritalStatus || "",
        email: userData.email || "",
        profilePic: null,
        coverPhoto: null,
      });

      setLoadingPosts(false);
    };

    fetchProfile();
  }, [finalUserId, token, currentUserId, navigate]);

  /* ================= SOCKET LISTENERS ================= */
  useEffect(() => {
  const socket = getSocket();
  if (!socket) return;

  const handleNewVideo = (post) => {
    if (post.user?._id === finalUserId) {
      setPosts((prev) => [post, ...prev]);
    }
  };

  const handleVideoLiked = ({ videoId, userId }) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === videoId
          ? {
              ...p,
              likes: p.likes.includes(userId)
                ? p.likes.filter((id) => id !== userId)
                : [...p.likes, userId],
            }
          : p
      )
    );
  };

  const handleNewComment = ({ videoId, comment }) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === videoId
          ? { ...p, comments: [...p.comments, comment] }
          : p
      )
    );
  };

  socket.on("new-video", handleNewVideo);
  socket.on("video-liked", handleVideoLiked);
  socket.on("new-video-comment", handleNewComment);

  return () => {
    socket.off("new-video", handleNewVideo);
    socket.off("video-liked", handleVideoLiked);
    socket.off("new-video-comment", handleNewComment);
  };
}, [finalUserId]);

  /* ================= ACTIONS ================= */
  const handleLike = (postId) => {
  const socket = getSocket();
  if (!socket) return;

  socket.emit("like-video", {
    videoId: postId,
    userId: currentUserId,
  });
};

const handleComment = (postId, text) => {
  const socket = getSocket();
  if (!socket) return;

  socket.emit("comment-video", {
    videoId: postId,
    text,
  });
};

  const handleFollow = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${finalUserId}/follow`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setIsFollowing(prev => !prev);
      else console.error("Follow error:", data.error);
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, [field]: file }));
    const url = URL.createObjectURL(file);
    if (field === "profilePic") setPreviewProfilePic(url);
    if (field === "coverPhoto") setPreviewCoverPhoto(url);
  };

  const handleSave = async () => {
    const data = new FormData();
    for (const key in formData) if (formData[key]) data.append(key, formData[key]);

    try {
      const res = await fetch(`${API_BASE}/api/users/${finalUserId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const result = await res.json();
      if (res.ok) {
        setUser(result.user);
        setPreviewProfilePic(result.user.profilePic || null);
        setPreviewCoverPhoto(result.user.coverPhoto || null);
        setEditing(false);
      } else console.error("Update error:", result.error);
    } catch (err) {
      console.error("Update profile error:", err);
    }
  };

  if (!user) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProfileHeader
        user={user}
        isOwner={finalUserId === currentUserId}
        onEdit={() => setEditing(true)}
        previewProfilePic={previewProfilePic}
        previewCoverPhoto={previewCoverPhoto}
      />

      {finalUserId !== currentUserId && (
        <div className="flex justify-end">
          <button onClick={handleFollow} className="px-4 py-2 bg-blue-500 text-white rounded">
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        </div>
      )}

      <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "Posts" && (
        <div className="space-y-4">
          {loadingPosts ? (
            <p className="text-center text-gray-500">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-500">No posts yet</p>
          ) : (
            posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={currentUserId}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))
          )}
        </div>
      )}

      {activeTab === "About" && <UserInfoCard user={user} />}

      {activeTab === "Photos" && (
        <div className="grid grid-cols-3 gap-2">
          {posts
            .flatMap(p => p.media || [])
            .filter(m => m.type === "image")
            .map((m, i) => (
              <img key={i} src={m.url} className="w-full h-32 object-cover rounded" />
            ))}
        </div>
      )}

      <EditProfileModal
        editing={editing}
        setEditing={setEditing}
        formData={formData}
        handleSave={handleSave}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        user={user}
      />
    </div>
  );
};

export default Profile;