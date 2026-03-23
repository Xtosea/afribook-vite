// src/pages/Profile.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import { fetchWithToken, API_BASE } from "../api/api";
import { socket } from "../socket";
import { FiUpload } from "react-icons/fi";

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
  const [uploading, setUploading] = useState(false);

  const profileInputRef = useRef();
  const coverInputRef = useRef();
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // ================= FORM FIELDS =================
  const [form, setForm] = useState({
    name: "",
    bio: "",
    intro: "",
    dob: "",
    email: "",
    phone: "",
    education: "",
    origin: "",
    maritalStatus: "",
  });

  // ================= FETCH PROFILE & POSTS =================
  useEffect(() => {
    if (!token) return navigate("/login");

    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const [userData, postsData] = await Promise.all([
          fetchWithToken(`${API_BASE}/api/users/${finalUserId}`, token),
          fetchWithToken(`${API_BASE}/api/posts/user/${finalUserId}?limit=10&page=1`, token),
        ]);

        if (!isMounted) return;

        setUser(userData);
        setForm({
          name: userData.name || "",
          bio: userData.bio || "",
          intro: userData.intro || "",
          dob: userData.dob || "",
          email: userData.email || "",
          phone: userData.phone || "",
          education: userData.education || "",
          origin: userData.origin || "",
          maritalStatus: userData.maritalStatus || "",
        });

        const followerIds = (userData.followers || []).map(f => (f._id ? f._id : f));
        setIsFollowing(followerIds.includes(currentUserId));

        const fixedPosts = postsData.map(post => ({
          ...post,
          user: post.user || {
            _id: null,
            name: "Deleted User",
            profilePic: `${API_BASE}/uploads/profiles/default-profile.png`,
          },
          media: post.media?.map(m => ({
            ...m,
            url: m.url.startsWith("http") ? m.url : `${API_BASE}${m.url}`,
          })),
          likes: post.likes || [],
          comments: post.comments || [],
        }));

        setPosts(fixedPosts);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, [finalUserId, token, currentUserId, navigate]);

  // ================= SOCKET.IO REAL-TIME =================
  useEffect(() => {
    socket.on("new-video", post => {
      if (post.user?._id === finalUserId) setPosts(prev => [post, ...prev]);
    });

    socket.on("new-video-comment", ({ videoId, comment }) => {
      setPosts(prev =>
        prev.map(p => (p._id === videoId ? { ...p, comments: [...p.comments, comment] } : p))
      );
    });

    socket.on("video-liked", ({ videoId, userId: likerId }) => {
      setPosts(prev =>
        prev.map(p => {
          if (p._id === videoId) {
            const likes = p.likes.includes(likerId)
              ? p.likes.filter(id => id !== likerId)
              : [...p.likes, likerId];
            return { ...p, likes };
          }
          return p;
        })
      );
    });

    socket.on("user-followed", ({ userId: followedUserId, followerId }) => {
      if (followedUserId === finalUserId) {
        setIsFollowing(prev => (followerId === currentUserId ? true : prev));
      }
    });

    return () => {
      socket.off("new-video");
      socket.off("new-video-comment");
      socket.off("video-liked");
      socket.off("user-followed");
    };
  }, [finalUserId, currentUserId]);

  // ================= INPUT HANDLERS =================
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleProfileFileChange = (e) => setProfileFile(e.target.files[0]);
  const handleCoverFileChange = (e) => setCoverFile(e.target.files[0]);

  // ================= SAVE PROFILE =================
  const handleSaveProfile = async () => {
    if (!token) return;
    setUploading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (profileFile) formData.append("profilePic", profileFile);
      if (coverFile) formData.append("coverPic", coverFile);

      const res = await fetch(`${API_BASE}/api/users/${finalUserId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUser(data.user);
      setEditing(false);
      setProfileFile(null);
      setCoverFile(null);
      profileInputRef.current.value = null;
      coverInputRef.current.value = null;
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Failed to update profile");
    } finally {
      setUploading(false);
    }
  };

  // ================= FOLLOW =================
  const handleFollow = () => {
    socket.emit("follow-user", { userId: finalUserId, followerId: currentUserId });
    setIsFollowing(prev => !prev);
  };

  const handleLike = (postId) => {
    socket.emit("like-video", { videoId: postId, userId: currentUserId });
  };

  const handleComment = (postId, text) => {
    socket.emit("comment-video", { videoId: postId, userId: currentUserId, text });
  };

  if (!user) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="container mx-auto py-6 px-2 md:px-6 space-y-6">
      {/* PROFILE HEADER */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <div className="relative">
          <img
            src={user.coverPic || `${API_BASE}/uploads/profiles/default-cover.png`}
            alt="cover"
            className="w-full h-48 object-cover rounded"
          />
          {editing && (
            <label className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded cursor-pointer flex items-center gap-1">
              <FiUpload /> Change Cover
              <input
                type="file"
                ref={coverInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleCoverFileChange}
              />
            </label>
          )}
        </div>

        <div className="flex items-center gap-4 mt-[-40px]">
          <div className="relative">
            <img
              src={user.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`}
              alt="profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white"
            />
            {editing && (
              <label className="absolute bottom-0 right-0 bg-black text-white px-2 py-1 rounded cursor-pointer flex items-center gap-1">
                <FiUpload /> Change
                <input
                  type="file"
                  ref={profileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfileFileChange}
                />
              </label>
            )}
          </div>

          <div className="flex-1 space-y-1">
            {editing ? (
              <>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className="border rounded px-2 py-1 w-full"
                />
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Bio"
                  className="border rounded px-2 py-1 w-full"
                />
                <input
                  name="intro"
                  value={form.intro}
                  onChange={handleChange}
                  placeholder="Intro"
                  className="border rounded px-2 py-1 w-full"
                />
                <input
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  type="date"
                  className="border rounded px-2 py-1 w-full"
                />
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="Email"
                  className="border rounded px-2 py-1 w-full"
                />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  type="tel"
                  placeholder="Phone"
                  className="border rounded px-2 py-1 w-full"
                />
                <input
                  name="education"
                  value={form.education}
                  onChange={handleChange}
                  placeholder="Education"
                  className="border rounded px-2 py-1 w-full"
                />
                <input
                  name="origin"
                  value={form.origin}
                  onChange={handleChange}
                  placeholder="Origin"
                  className="border rounded px-2 py-1 w-full"
                />
                <input
                  name="maritalStatus"
                  value={form.maritalStatus}
                  onChange={handleChange}
                  placeholder="Marital Status"
                  className="border rounded px-2 py-1 w-full"
                />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-500">{user.bio}</p>
                {user.intro && <p className="text-gray-600">{user.intro}</p>}
                {user.dob && <p>DOB: {user.dob}</p>}
                {user.email && <p>Email: {user.email}</p>}
                {user.phone && <p>Phone: {user.phone}</p>}
                {user.education && <p>Education: {user.education}</p>}
                {user.origin && <p>Origin: {user.origin}</p>}
                {user.maritalStatus && <p>Marital Status: {user.maritalStatus}</p>}
              </>
            )}
          </div>
        </div>

        <div>
          {finalUserId === currentUserId ? (
            editing ? (
              <button
                onClick={handleSaveProfile}
                disabled={uploading}
                className="px-6 py-2 bg-green-500 text-white rounded mr-2"
              >
                {uploading ? "Saving..." : "Save Profile"}
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-2 bg-blue-500 text-white rounded mr-2"
              >
                Edit Profile
              </button>
            )
          ) : (
            <button
              onClick={handleFollow}
              className="px-6 py-2 bg-blue-500 text-white rounded"
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>
      </div>

      {/* POSTS */}
      <div className="space-y-6">
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
    </div>
  );
};

export default Profile;