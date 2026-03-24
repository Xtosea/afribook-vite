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

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchProfile = async () => {
      const userData = await fetchWithToken(`${API_BASE}/api/users/${finalUserId}`, token);
      const postsData = await fetchWithToken(`${API_BASE}/api/posts/user/${finalUserId}`, token);

      setUser(userData);
      setPosts(postsData || []);

      setPreviewProfilePic(userData.profilePic);
      setPreviewCoverPhoto(userData.coverPhoto);

      setFormData({
        ...userData,
        profilePic: null,
        coverPhoto: null,
      });

      setLoadingPosts(false);
    };

    fetchProfile();
  }, [finalUserId, token]);

  /* ================= FILE CHANGE ================= */
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData(prev => ({ ...prev, [field]: file }));

    const preview = URL.createObjectURL(file);
    if (field === "profilePic") setPreviewProfilePic(preview);
    if (field === "coverPhoto") setPreviewCoverPhoto(preview);
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      let profilePicUrl = user.profilePic;
      let coverPhotoUrl = user.coverPhoto;

      if (formData.profilePic) {
        profilePicUrl = await uploadImageKit(formData.profilePic, token);
      }

      if (formData.coverPhoto) {
        coverPhotoUrl = await uploadImageKit(formData.coverPhoto, token);
      }

      const payload = {
        ...formData,
        profilePic: profilePicUrl,
        coverPhoto: coverPhotoUrl,
      };

      delete payload.profilePic instanceof File;
      delete payload.coverPhoto instanceof File;

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

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="container mx-auto py-6 space-y-6">

      <ProfileHeader
        user={user}
        isOwner={true}
        onEdit={() => setEditing(true)}
        previewProfilePic={previewProfilePic}
        previewCoverPhoto={previewCoverPhoto}
      />

      <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "Posts" && (
        <div className="space-y-4">
          {loadingPosts ? <p>Loading...</p> :
            posts.map(post => (
              <PostCard key={post._id} post={post} currentUserId={currentUserId} />
            ))
          }
        </div>
      )}

      {activeTab === "About" && <UserInfoCard user={user} />}

      <EditProfileModal
        editing={editing}
        setEditing={setEditing}
        formData={formData}
        handleSave={handleSave}
        handleFileChange={handleFileChange}
      />

    </div>
  );
};

export default Profile;