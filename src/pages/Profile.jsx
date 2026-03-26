import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import { fetchWithToken, API_BASE } from "../api/api";

import ProfileHeader from "../components/profile/ProfileHeader";
import UserInfoCard from "../components/profile/UserInfoCard";
import ProfileTabs from "../components/profile/ProfileTabs";
import EditProfileModal from "../components/profile/EditProfileModal";
import { useImageKitUpload } from "../hooks/useImageKitUpload";

const POSTS_LIMIT = 10;

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef();

  const lastPostRef = useCallback(node => {
    if (loadingPosts) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loadingPosts, hasMore]);

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
    "name","bio","intro","dob","phone","education",
    "origin","maritalStatus","spouse","gender","email","hubby"
  ];

  /* ================= CACHE PROFILE ================= */
  const cachedProfile = localStorage.getItem(`profile-${finalUserId}`);

  useEffect(() => {
    if (cachedProfile) {
      const parsed = JSON.parse(cachedProfile);
      setUser(parsed);
      setPreviewProfilePic(parsed.profilePic);
      setPreviewCoverPhoto(parsed.coverPhoto);
    }
  }, [finalUserId]);


  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const userData = await fetchWithToken(
          `${API_BASE}/api/users/${finalUserId}`,
          token
        );

        setUser(userData);
        setPreviewProfilePic(userData.profilePic);
        setPreviewCoverPhoto(userData.coverPhoto);

        localStorage.setItem(
          `profile-${finalUserId}`,
          JSON.stringify(userData)
        );

        setFormData({
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
        });

      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();

  }, [finalUserId]);


  /* ================= FETCH POSTS (INFINITE SCROLL) ================= */
  useEffect(() => {
    if (!token) return;

    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);

        const data = await fetchWithToken(
          `${API_BASE}/api/posts/user/${finalUserId}?page=${page}&limit=${POSTS_LIMIT}`,
          token
        );

        if (data.length < POSTS_LIMIT) {
          setHasMore(false);
        }

        setPosts(prev => [...prev, ...data]);

      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [page, finalUserId]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData(prev => ({ ...prev, [field]: file }));

    const preview = URL.createObjectURL(file);

    if (field === "profilePic") setPreviewProfilePic(preview);
    if (field === "coverPhoto") setPreviewCoverPhoto(preview);
  };


  const handleSave = async () => {
    try {
      setSaving(true);

      const form = new FormData();

      let profileUrl = previewProfilePic;
      let coverUrl = previewCoverPhoto;

      if (formData.profilePic instanceof File) {
        profileUrl = await uploadImageKit(formData.profilePic);
      }

      if (formData.coverPhoto instanceof File) {
        coverUrl = await uploadImageKit(formData.coverPhoto);
      }

      form.append("profilePic", profileUrl || "");
      form.append("coverPhoto", coverUrl || "");

      fields.forEach(field =>
        form.append(field, formData[field] || "")
      );

      const res = await fetch(`${API_BASE}/api/users/${finalUserId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const result = await res.json();

      setUser(result.user);
      setEditing(false);

      localStorage.setItem(
        `profile-${finalUserId}`,
        JSON.stringify(result.user)
      );

    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };


  if (!user)
    return (
      <div className="p-6 animate-pulse">
        <div className="h-40 bg-gray-200 rounded mb-4" />
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
      </div>
    );


  return (
    <div className="container mx-auto py-6 space-y-6">

      <ProfileHeader
        user={user}
        isOwner={true}
        onEdit={() => setEditing(true)}
        previewProfilePic={previewProfilePic}
        previewCoverPhoto={previewCoverPhoto}
      />

      <ProfileTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "Posts" && (
        <div className="space-y-4">

          {posts.map((post, index) => {
            if (posts.length === index + 1) {
              return (
                <div ref={lastPostRef} key={post._id}>
                  <PostCard
                    post={post}
                    currentUserId={currentUserId}
                    lazyLoad
                  />
                </div>
              );
            }

            return (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={currentUserId}
                lazyLoad
              />
            );
          })}

          {loadingPosts && (
            <div className="text-center py-4">
              Loading more posts...
            </div>
          )}

        </div>
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
        previewProfilePic={previewProfilePic}
        previewCoverPhoto={previewCoverPhoto}
      />

    </div>
  );
};

export default Profile;