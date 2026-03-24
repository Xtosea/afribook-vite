// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import { fetchWithToken, API_BASE } from "../api/api";

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
  const [saving, setSaving] = useState(false); // spinner
  const [uploadProgress, setUploadProgress] = useState(0); // progress bar

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

  /* ================= FETCH PROFILE & POSTS ================= */
  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchProfile = async () => {
      try {
        const userData = await fetchWithToken(
          `${API_BASE}/api/users/${finalUserId}`,
          token
        );
        const postsData = await fetchWithToken(
          `${API_BASE}/api/posts/user/${finalUserId}`,
          token
        );

        setUser(userData);
        setPosts(postsData || []);

        setPreviewProfilePic(userData.profilePic);
        setPreviewCoverPhoto(userData.coverPhoto);

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

    const preview = URL.createObjectURL(file);
    if (field === "profilePic") setPreviewProfilePic(preview);
    if (field === "coverPhoto") setPreviewCoverPhoto(preview);
  };

  /* ================= SAVE PROFILE ================= */
  const handleSave = async () => {
    try {
      setSaving(true);
      setUploadProgress(0);

      let profilePicUrl = user.profilePic;
      let coverPhotoUrl = user.coverPhoto;

      // Upload profile picture if selected
      if (formData.profilePic) {
        profilePicUrl = await uploadImageKit(formData.profilePic, token, (progress) =>
          setUploadProgress(progress)
        );
      }

      // Upload cover photo if selected
      if (formData.coverPhoto) {
        coverPhotoUrl = await uploadImageKit(formData.coverPhoto, token, (progress) =>
          setUploadProgress(progress)
        );
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
        profilePic: profilePicUrl,
        coverPhoto: coverPhotoUrl,
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
      setSaving(false);
      setUploadProgress(0);
    } catch (err) {
      console.error("Profile update error:", err);
      setSaving(false);
      setUploadProgress(0);
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
          {loadingPosts ? (
            <p>Loading...</p>
          ) : (
            posts.map((post) => (
              <PostCard key={post._id} post={post} currentUserId={currentUserId} />
            ))
          )}
        </div>
      )}

      {activeTab === "About" && (
        <UserInfoCard user={user} editable={true} formData={formData} setFormData={setFormData} />
      )}

      <EditProfileModal
        editing={editing}
        setEditing={setEditing}
        formData={formData}
        handleSave={handleSave}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        saving={saving}
        uploadProgress={uploadProgress}
      />
    </div>
  );
};

export default Profile;