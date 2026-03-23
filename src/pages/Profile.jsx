// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // ================= EDIT MODAL =================
  const [editing, setEditing] = useState(false);
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

        // Prefill form data for editing
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

  // ================= ACTION HANDLERS =================
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    setFormData(prev => ({ ...prev, [field]: e.target.files[0] }));
  };

  const handleSave = async () => {
    const data = new FormData();
    for (const key in formData) {
      if (formData[key] instanceof File) data.append(key, formData[key]);
      else data.append(key, formData[key]);
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
        alert(result.error || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
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
            className="w-full h-48 object-cover rounded mb-4"
          />
          {finalUserId === currentUserId && (
            <button
              onClick={() => setEditing(true)}
              className="absolute top-2 right-2 bg-white px-2 py-1 rounded shadow"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <img
            src={user.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`}
            alt="profile"
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500">{user.bio}</p>
            <p className="text-gray-400">{user.intro}</p>
            <p className="text-gray-400">DOB: {user.dob}</p>
            <p className="text-gray-400">Phone: {user.phone}</p>
            <p className="text-gray-400">Email: {user.email}</p>
            <p className="text-gray-400">Education: {user.education}</p>
            <p className="text-gray-400">Origin: {user.origin}</p>
            <p className="text-gray-400">Marital Status: {user.maritalStatus}</p>
          </div>
        </div>

        {finalUserId !== currentUserId && (
          <button
            onClick={handleFollow}
            className="px-6 py-2 bg-blue-500 text-white rounded"
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
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

      {/* ================= MODAL ================= */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-xl p-6 rounded shadow-lg relative">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setEditing(false)}
            >
              ✕
            </button>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto">
              {["name", "bio", "intro", "dob", "phone", "education", "origin", "maritalStatus", "email"].map(field => (
                <input
                  key={field}
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  className="w-full border px-2 py-1 rounded"
                />
              ))}

              {/* Profile Picture Upload + Preview */}
              <div>
                <label className="block">Profile Picture:</label>
                <input type="file" accept="image/*" onChange={e => handleFileChange(e, "profilePic")} />
                {formData.profilePic && (
                  <img
                    src={URL.createObjectURL(formData.profilePic)}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover mt-2"
                  />
                )}
              </div>

              {/* Cover Photo Upload + Preview */}
              <div>
                <label className="block">Cover Photo:</label>
                <input type="file" accept="image/*" onChange={e => handleFileChange(e, "coverPhoto")} />
                {formData.coverPhoto && (
                  <img
                    src={URL.createObjectURL(formData.coverPhoto)}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded mt-2"
                  />
                )}
              </div>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded mt-2"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;