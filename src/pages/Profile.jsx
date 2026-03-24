import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import { fetchWithToken, API_BASE } from "../api/api";

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
    spouse: "",
    gender: "",
    email: "",
    hubby: "",
    profilePic: null,
    coverPhoto: null,
  });

  const [previewProfilePic, setPreviewProfilePic] = useState(null);
  const [previewCoverPhoto, setPreviewCoverPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH PROFILE & POSTS ================= */
  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchProfile = async () => {
      try {
        const userData = await fetchWithToken(`${API_BASE}/api/users/${finalUserId}`, token);
        const postsData = await fetchWithToken(`${API_BASE}/api/posts/user/${finalUserId}`, token);

        setUser(userData);
        setPosts(postsData || []);
        setPreviewProfilePic(userData.profilePic);
        setPreviewCoverPhoto(userData.coverPhoto);

        setFormData({
          ...formData,
          ...userData,
          profilePic: null,
          coverPhoto: null,
        });
      } catch (err) {
        console.error("FETCH ERROR:", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchProfile();
  }, [finalUserId, token, navigate]);

  /* ================= INPUT CHANGE HANDLER ================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= FILE CHANGE HANDLER ================= */
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, [field]: file }));
    if (field === "profilePic") setPreviewProfilePic(URL.createObjectURL(file));
    if (field === "coverPhoto") setPreviewCoverPhoto(URL.createObjectURL(file));
  };

  /* ================= SAVE PROFILE ================= */
  const handleSave = async () => {
    try {
      setSaving(true);
      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          form.append(key, value);
        } else {
          form.append(key, value || "");
        }
      });

      const res = await fetch(`${API_BASE}/api/users/${finalUserId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setUser(result.user);
      setPreviewProfilePic(result.user.profilePic);
      setPreviewCoverPhoto(result.user.coverPhoto);
      setEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setSaving(false);
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
          {loadingPosts ? <p>Loading...</p> : posts.map((post) => <PostCard key={post._id} post={post} currentUserId={currentUserId} />)}
        </div>
      )}

      {activeTab === "About" && (
        <UserInfoCard user={user} editable={editing} formData={formData} setFormData={setFormData} handleSave={handleSave} />
      )}

      <EditProfileModal
        editing={editing}
        setEditing={setEditing}
        formData={formData}
        handleSave={handleSave}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        uploading={saving}
      />
    </div>
  );
};

export default Profile;