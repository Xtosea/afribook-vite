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
  const [uploadProgress, setUploadProgress] = useState({
    profilePic: 0,
    coverPhoto: 0,
  });

  const fields = [
    "name", "bio", "intro", "dob", "phone",
    "education", "origin", "maritalStatus", "spouse",
    "gender", "email", "hubby"
  ];

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

        setFormData((prev) => ({
          ...prev,
          name: userData.name || "",
          bio: userData.bio || "",
          intro: userData.intro || "",
          dob: userData.dob || "",
          phone: userData.phone || "",
          education: userData.education || "",
          origin: userData.origin || "",
          maritalStatus: userData.maritalStatus || "",
          spouse: userData.spouse || "",
          gender: userData.gender || "",
          email: userData.email || "",
          hubby: userData.hubby || "",
          profilePic: null,
          coverPhoto: null,
        }));
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

  /* ================= SAVE PROFILE WITH IMAGEKIT ================= */
  const handleSave = async () => {
    try {
      setSaving(true);
      const form = new FormData();

      // Upload profilePic
      if (formData.profilePic instanceof File) {
        const url = await uploadImageKit(formData.profilePic, (p) =>
          setUploadProgress((prev) => ({ ...prev, profilePic: p }))
        );
        form.append("profilePic", url);
      }

      // Upload coverPhoto
      if (formData.coverPhoto instanceof File) {
        const url = await uploadImageKit(formData.coverPhoto, (p) =>
          setUploadProgress((prev) => ({ ...prev, coverPhoto: p }))
        );
        form.append("coverPhoto", url);
      }

      // Append other fields
      fields.forEach((field) => form.append(field, formData[field] || ""));

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
      setUploadProgress({ profilePic: 0, coverPhoto: 0 });
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
          {loadingPosts
            ? <p>Loading...</p>
            : posts.map((post) => (
                <PostCard key={post._id} post={post} currentUserId={currentUserId} />
              ))
          }
        </div>
      )}

      {activeTab === "About" && (
        <UserInfoCard
          user={user}
          editable={editing}
          formData={formData}
          setFormData={setFormData}
          handleSave={handleSave}
        />
      )}

      <EditProfileModal
        editing={editing}
        setEditing={setEditing}
        formData={formData}
        handleSave={handleSave}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        uploading={saving}
        uploadProgress={uploadProgress}
      />
    </div>
  );
};

export default Profile;