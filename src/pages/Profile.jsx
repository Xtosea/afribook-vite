// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import { fetchWithToken, API_BASE } from "../api/api";
import { socket } from "../socket";

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

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchProfile = async () => {
      try {
        const [userData, postsData] = await Promise.all([
          fetchWithToken(`${API_BASE}/api/users/${finalUserId}`, token),
          fetchWithToken(`${API_BASE}/api/posts/user/${finalUserId}`, token),
        ]);

        setUser(userData);

        const followerIds = (userData.followers || []).map(f => f._id || f);
        setIsFollowing(followerIds.includes(currentUserId));

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

      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchProfile();
  }, [finalUserId]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    socket.on("new-video", post => {
      if (post.user?._id === finalUserId) {
        setPosts(prev => [post, ...prev]);
      }
    });

    socket.on("video-liked", ({ videoId, userId }) => {
      setPosts(prev =>
        prev.map(p =>
          p._id === videoId
            ? {
                ...p,
                likes: p.likes.includes(userId)
                  ? p.likes.filter(id => id !== userId)
                  : [...p.likes, userId],
              }
            : p
        )
      );
    });

    socket.on("new-video-comment", ({ videoId, comment }) => {
      setPosts(prev =>
        prev.map(p =>
          p._id === videoId
            ? { ...p, comments: [...p.comments, comment] }
            : p
        )
      );
    });

    return () => {
      socket.off("new-video");
      socket.off("video-liked");
      socket.off("new-video-comment");
    };
  }, []);

  /* ================= ACTIONS ================= */
  const handleLike = (postId) => {
    socket.emit("like-video", { videoId: postId, userId: currentUserId });
  };

  const handleComment = (postId, text) => {
    socket.emit("comment-video", { videoId: postId, text });
  };

  const handleFollow = () => {
    socket.emit("follow-user", {
      userId: finalUserId,
      followerId: currentUserId,
    });
    setIsFollowing(prev => !prev);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    setFormData(prev => ({ ...prev, [field]: e.target.files[0] }));
  };

  const handleSave = async () => {
    const data = new FormData();

    for (const key in formData) {
      if (formData[key]) data.append(key, formData[key]);
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/${finalUserId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const result = await res.json();

      if (res.ok) {
        setUser(result.user);
        setEditing(false);
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="container mx-auto py-6 space-y-6">

      {/* HEADER */}
      <ProfileHeader
        user={user}
        isOwner={finalUserId === currentUserId}
        onEdit={() => setEditing(true)}
      />

      {/* FOLLOW BUTTON (if not owner) */}
      {finalUserId !== currentUserId && (
        <div className="flex justify-end">
          <button
            onClick={handleFollow}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        </div>
      )}

      {/* TABS */}
      <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* POSTS TAB */}
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

      {/* ABOUT TAB */}
      {activeTab === "About" && <UserInfoCard user={user} />}

      {/* PHOTOS TAB */}
      {activeTab === "Photos" && (
        <div className="grid grid-cols-3 gap-2">
          {posts
            .flatMap(p => p.media || [])
            .filter(m => m.type === "image")
            .map((m, i) => (
              <img
                key={i}
                src={m.url}
                className="w-full h-32 object-cover rounded"
              />
            ))}
        </div>
      )}

      {/* EDIT MODAL */}
      <EditProfileModal
        editing={editing}
        setEditing={setEditing}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        user={user}
      />

    </div>
  );
};

export default Profile;