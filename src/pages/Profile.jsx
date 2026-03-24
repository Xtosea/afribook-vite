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
import { useImageKitUpload } from "../hooks/useImageKitUpload";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const finalUserId = userId || currentUserId;

  const { uploadImageKit } = useImageKitUpload();

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

  /* ================= SAFE FETCH ================= */
  const safeFetch = async (url) => {
    try {
      const data = await fetchWithToken(url, token);
      return data;
    } catch (err) {
      console.error("Fetch error:", err);
      return null;
    }
  };

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchProfile = async () => {
      setLoadingPosts(true);

      const userData = await safeFetch(`${API_BASE}/api/users/${finalUserId}`);
      if (!userData) return;

      setUser(userData);
      setPreviewProfilePic(userData.profilePic || null);
      setPreviewCoverPhoto(userData.coverPhoto || null);

      const followerIds = (userData.followers || []).map(f => f._id || f);
      setIsFollowing(followerIds.includes(currentUserId));

      const postsData = await safeFetch(`${API_BASE}/api/posts/user/${finalUserId}`) || [];

      setPosts(postsData);

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
  }, [finalUserId, token]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("new-video", (post) => {
      if (post.user?._id === finalUserId) {
        setPosts(prev => [post, ...prev]);
      }
    });

    return () => socket.off("new-video");
  }, [finalUserId]);

  /* ================= INPUT ================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ================= FILE CHANGE ================= */
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData(prev => ({ ...prev, [field]: file }));

    const preview = URL.createObjectURL(file);
    if (field === "profilePic") setPreviewProfilePic(preview);
    if (field === "coverPhoto") setPreviewCoverPhoto(preview);
  };

  /* ================= SAVE PROFILE ================= */
  const handleSave = async () => {
    try {
      let uploadedProfilePic = user.profilePic;
      let uploadedCoverPhoto = user.coverPhoto;

      // Upload profile picture
      if (formData.profilePic) {
        uploadedProfilePic = await uploadImageKit(formData.profilePic, token);
      }

      // Upload cover photo
      if (formData.coverPhoto) {
        uploadedCoverPhoto = await uploadImageKit(formData.coverPhoto, token);
      }

      const payload = {
        name: formData.name,
        bio: formData.bio,
        intro: formData.intro,
        dob: formData.dob,
        phone: formData.phone,
        education: formData.education,
        origin: formData.origin,
        maritalStatus: formData.maritalStatus,
        email: formData.email,
        profilePic: uploadedProfilePic,
        coverPhoto: uploadedCoverPhoto,
      };

      const res = await fetch(`${API_BASE}/api/users/${finalUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setUser(result.user);
      setPreviewProfilePic(result.user.profilePic);
      setPreviewCoverPhoto(result.user.coverPhoto);
      setEditing(false);

    } catch (err) {
      console.error("Profile update error:", err);
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

      <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "Posts" && (
        <div className="space-y-4">
          {loadingPosts ? (
            <p>Loading...</p>
          ) : posts.length === 0 ? (
            <p>No posts yet</p>
          ) : (
            posts.map(post => (
              <PostCard key={post._id} post={post} currentUserId={currentUserId} />
            ))
          )}
        </div>
      )}

      {activeTab === "About" && <UserInfoCard user={user} />}

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