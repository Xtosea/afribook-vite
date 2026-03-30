// src/pages/Profile.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostCard from "../../components/PostCard";
import { fetchWithToken, API_BASE } from "../api/api";

import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileTabs from "../components/profile/ProfileTabs";
import EditProfileModal from "../components/profile/EditProfileModal";
import AboutSection from "../components/profile/AboutSection";
import PhotosSection from "../components/profile/PhotosSection";
import FriendsSection from "../components/profile/FriendsSection";
import VideosSection from "../components/profile/VideosSection";
import ReelsSection from "../components/profile/ReelsSection";

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
  const [friends, setFriends] = useState([]);
  const [videos, setVideos] = useState([]);
  const [reels, setReels] = useState([]);

  const [loadingPosts, setLoadingPosts] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("Posts");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef();

  const lastPostRef = useCallback(
    (node) => {
      if (loadingPosts) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadingPosts, hasMore]
  );

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

  const fields = [
    "name",
    "bio",
    "intro",
    "dob",
    "phone",
    "education",
    "origin",
    "maritalStatus",
    "spouse",
    "gender",
    "email",
    "hubby",
  ];

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

        setFriends(userData.friends || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, [finalUserId]);

  /* ================= FETCH POSTS ================= */

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

        setPosts((prev) => [...prev, ...data]);

        /* Filter Videos + Reels */

        const vids = data.filter(
          (p) =>
            p.media?.some((m) => m.type === "video")
        );

        const reelsData = data.filter(
          (p) => p.isReel || p.reel
        );

        setVideos((prev) => [...prev, ...vids]);
        setReels((prev) => [...prev, ...reelsData]);

      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [page, finalUserId]);

  if (!user)
    return (
      <div className="p-6 animate-pulse">
        <div className="h-40 bg-gray-200 rounded mb-4" />
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

      {/* ================= TAB CONTENT ================= */}

      {activeTab === "Posts" && (
        <div className="space-y-4">
          {posts.map((post, index) => {
            if (posts.length === index + 1) {
              return (
                <div ref={lastPostRef} key={post._id}>
                  <PostCard post={post} />
                </div>
              );
            }

            return <PostCard key={post._id} post={post} />;
          })}

          {loadingPosts && (
            <div className="text-center py-4">
              Loading...
            </div>
          )}
        </div>
      )}

      {activeTab === "About" && (
        <AboutSection user={user} />
      )}

      {activeTab === "Photos" && (
        <PhotosSection
          posts={posts}
          user={user}
        />
      )}

      {activeTab === "Friends" && (
        <FriendsSection
          friends={friends}
        />
      )}

      {activeTab === "Videos" && (
        <VideosSection
          videos={videos}
        />
      )}

      {activeTab === "Reels" && (
        <ReelsSection
          reels={reels}
        />
      )}

      <EditProfileModal
        editing={editing}
        setEditing={setEditing}
        formData={formData}
        previewProfilePic={previewProfilePic}
        previewCoverPhoto={previewCoverPhoto}
        uploading={saving}
      />

    </div>
  );
};

export default Profile;