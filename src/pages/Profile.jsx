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

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchProfile = async () => {
      try {
        const [userData, postsData] = await Promise.all([
          fetchWithToken(`${API_BASE}/api/users/${finalUserId}`, token),
          fetchWithToken(`${API_BASE}/api/posts/user/${finalUserId}`, token),
        ]);

        setUser(userData);

        const followerIds = (userData.followers || []).map(f => f._id || f);
        setIsFollowing(followerIds.includes(currentUserId));

        const fixedPosts = postsData.map(post => ({
          ...post,
          media: post.media?.map(m => ({
            ...m,
            url: m.url.startsWith("http") ? m.url : `${API_BASE}${m.url}`,
          })),
          likes: post.likes || [],
          comments: post.comments || [],
        }));

        setPosts(fixedPosts);

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
        navigate("/login");
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchProfile();
  }, [finalUserId]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    socket.on("new-video", post => {
      if (post.user?._id === finalUserId) {
        setPosts(prev => [post, ...prev]);
      }
    });

    socket.on("video-liked", ({ videoId, userId }) => {
      setPosts(prev =>
        prev.map(p =>
          p._id === videoId
            ? {
                ...p,
                likes: p.likes.includes(userId)
                  ? p.likes.filter(id => id !== userId)
                  : [...p.likes, userId],
              }
            : p
        )
      );
    });

    socket.on("new-video-comment", ({ videoId, comment }) => {
      setPosts(prev =>
        prev.map(p =>
          p._id === videoId
            ? { ...p, comments: [...p.comments, comment] }
            : p
        )
      );
    });

    return () => {
      socket.off("new-video");
      socket.off("video-liked");
      socket.off("new-video-comment");
    };
  }, []);

  /* ================= ACTIONS ================= */
  const handleLike = (postId) => {
    socket.emit("like-video", { videoId: postId, userId: currentUserId });
  };

  const handleComment = (postId, text) => {
    socket.emit("comment-video", { videoId: postId, text });
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
      if (formData[key]) data.append(key, formData[key]);
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
        alert(result.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="container mx-auto py-6 space-y-6">

      {/* COVER */}
      <div className="relative">
        <img
          src={
            formData.coverPhoto
              ? URL.createObjectURL(formData.coverPhoto)
              : user.coverPhoto || `${API_BASE}/uploads/profiles/default-cover.png`
          }
          className="w-full h-48 object-cover rounded"
        />

        {finalUserId === currentUserId && (
          <button
            onClick={() => setEditing(true)}
            className="absolute top-2 right-2 bg-white px-3 py-1 rounded shadow"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* PROFILE INFO */}
      <div className="flex gap-4 items-center">
        <img
          src={
            formData.profilePic
              ? URL.createObjectURL(formData.profilePic)
              : user.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`
          }
          className="w-24 h-24 rounded-full object-cover"
        />

        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p>{user.bio}</p>
          <p>{user.intro}</p>
        </div>
      </div>

      {/* POSTS */}
      {posts.map(post => (
        <PostCard
          key={post._id}
          post={post}
          currentUserId={currentUserId}
          onLike={handleLike}
          onComment={handleComment}
        />
      ))}

      {/* ================= MODAL ================= */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2">
          <div className="bg-white w-full max-w-3xl rounded-xl overflow-hidden">

            {/* HEADER */}
            <div className="flex justify-between p-4 border-b">
              <h2 className="font-semibold">Edit Profile</h2>
              <button onClick={() => setEditing(false)}>✕</button>
            </div>

            {/* COVER */}
            <div className="relative">
              <img
                src={
                  formData.coverPhoto
                    ? URL.createObjectURL(formData.coverPhoto)
                    : user.coverPhoto || `${API_BASE}/uploads/profiles/default-cover.png`
                }
                className="w-full h-40 object-cover"
              />
              <label className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded cursor-pointer">
                Change Cover
                <input type="file" hidden onChange={(e) => handleFileChange(e, "coverPhoto")} />
              </label>
            </div>

            <div className="p-4 flex gap-6 flex-col md:flex-row">

              {/* PROFILE PIC */}
              <div className="flex flex-col items-center">
                <img
                  src={
                    formData.profilePic
                      ? URL.createObjectURL(formData.profilePic)
                      : user.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`
                  }
                  className="w-28 h-28 rounded-full"
                />
                <label className="mt-2 cursor-pointer">
                  Change Photo
                  <input type="file" hidden onChange={(e) => handleFileChange(e, "profilePic")} />
                </label>
              </div>

              {/* INPUTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                {Object.keys(formData).map((field) =>
                  field !== "profilePic" && field !== "coverPhoto" ? (
                    <input
                      key={field}
                      name={field}
                      value={formData[field]}
                      onChange={handleInputChange}
                      placeholder={field}
                      className="border px-2 py-2 rounded"
                    />
                  ) : null
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t">
              <button onClick={() => setEditing(false)}>Cancel</button>
              <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">
                Save
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;