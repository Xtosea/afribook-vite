// src/pages/Profile.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import { fetchWithToken, API_BASE } from "../api/api";
import { socket } from "../socket";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const finalUserId = userId || currentUserId;

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
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
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const profilePicRef = useRef();
  const coverPhotoRef = useRef();
  const [posting, setPosting] = useState(false);

  /* ================= FETCH PROFILE & POSTS ================= */
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

        const followerIds = (userData.followers || []).map(f => (f._id ? f._id : f));
        setIsFollowing(followerIds.includes(currentUserId));

        setFormData({
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

  /* ================= SOCKET.IO LIVE UPDATES ================= */
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

    socket.on("profile-updated", updatedUser => {
      if (updatedUser._id === finalUserId) {
        setUser(prev => ({ ...prev, ...updatedUser }));
        setFormData({
          name: updatedUser.name || "",
          bio: updatedUser.bio || "",
          intro: updatedUser.intro || "",
          dob: updatedUser.dob || "",
          email: updatedUser.email || "",
          phone: updatedUser.phone || "",
          education: updatedUser.education || "",
          origin: updatedUser.origin || "",
          maritalStatus: updatedUser.maritalStatus || "",
        });
      }
    });

    return () => {
      socket.off("new-video");
      socket.off("new-video-comment");
      socket.off("video-liked");
      socket.off("user-followed");
      socket.off("profile-updated");
    };
  }, [finalUserId, currentUserId]);

  /* ================= ACTION HANDLERS ================= */
  const handleLike = (postId) => {
    socket.emit("like-video", { videoId: postId, userId: currentUserId });
  };

  const handleComment = (postId, text) => {
    socket.emit("comment-video", { videoId: postId, userId: currentUserId, text });
  };

  const handleFollow = () => {
    socket.emit("follow-user", { userId: finalUserId, followerId: currentUserId });
    setIsFollowing(prev => !prev);
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === "profilePic") setProfilePicFile(file);
    if (type === "coverPhoto") setCoverPhotoFile(file);
  };

  const handleSaveProfile = async () => {
    if (!token) return;
    setPosting(true);

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    if (profilePicFile) formDataToSend.append("profilePic", profilePicFile);
    if (coverPhotoFile) formDataToSend.append("coverPhoto", coverPhotoFile);

    try {
      const res = await fetch(`${API_BASE}/api/users/${finalUserId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setUser(data.user);
      setEditMode(false);
      setProfilePicFile(null);
      setCoverPhotoFile(null);
      profilePicRef.current.value = null;
      coverPhotoRef.current.value = null;
    } catch (err) {
      console.error(err);
      alert("Profile update failed");
    } finally {
      setPosting(false);
    }
  };

  if (!user) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="container mx-auto py-6 px-2 md:px-6 space-y-6">

      {/* PROFILE INFO */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <div className="relative">
          <img
            src={user.coverPhoto || `${API_BASE}/uploads/profiles/default-cover.png`}
            alt="cover"
            className="w-full h-56 object-cover rounded"
          />
          {editMode && (
            <input
              type="file"
              ref={coverPhotoRef}
              onChange={(e) => handleFileChange(e, "coverPhoto")}
              className="absolute top-2 left-2 opacity-70"
            />
          )}
        </div>

        <div className="flex items-center gap-4 mt-[-3rem]">
          <div className="relative">
            <img
              src={user.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`}
              alt="profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white"
            />
            {editMode && (
              <input
                type="file"
                ref={profilePicRef}
                onChange={(e) => handleFileChange(e, "profilePic")}
                className="absolute bottom-0 right-0 opacity-70"
              />
            )}
          </div>
          <div>
            {editMode ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="border p-1 rounded w-full"
                placeholder="Name"
              />
            ) : (
              <h1 className="text-2xl font-bold">{user.name}</h1>
            )}
            {editMode ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="border p-1 rounded w-full mt-1"
                placeholder="Bio"
              />
            ) : (
              <p className="text-gray-500">{user.bio}</p>
            )}
            {editMode && (
              <input
                type="text"
                name="intro"
                value={formData.intro}
                onChange={handleInputChange}
                className="border p-1 rounded w-full mt-1"
                placeholder="Intro"
              />
            )}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap mt-2">
          {finalUserId !== currentUserId && (
            <button
              onClick={handleFollow}
              className="px-6 py-2 bg-blue-500 text-white rounded"
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
          {finalUserId === currentUserId && (
            <>
              <button
                onClick={() => setEditMode(prev => !prev)}
                className="px-6 py-2 bg-gray-300 text-black rounded"
              >
                {editMode ? "Cancel" : "Edit Profile"}
              </button>
              {editMode && (
                <button
                  onClick={handleSaveProfile}
                  disabled={posting}
                  className="px-6 py-2 bg-green-500 text-white rounded"
                >
                  {posting ? "Saving..." : "Save Changes"}
                </button>
              )}
            </>
          )}
        </div>

        {editMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="border p-1 rounded"
            />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone"
              className="border p-1 rounded"
            />
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              placeholder="Date of Birth"
              className="border p-1 rounded"
            />
            <input
              type="text"
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              placeholder="Education"
              className="border p-1 rounded"
            />
            <input
              type="text"
              name="origin"
              value={formData.origin}
              onChange={handleInputChange}
              placeholder="Origin"
              className="border p-1 rounded"
            />
            <input
              type="text"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleInputChange}
              placeholder="Marital Status"
              className="border p-1 rounded"
            />
          </div>
        )}
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