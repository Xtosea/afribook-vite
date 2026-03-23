import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import { fetchWithToken, API_BASE } from "../api/api";
import ProfilePicUploader from "../components/ProfilePicUploader";
import CoverPicUploader from "../components/CoverPicUploader";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [intro, setIntro] = useState("");
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState("posts");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("followers");
  const [loadingPosts, setLoadingPosts] = useState(true);

  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const finalUserId = userId || currentUserId;

  const feedRef = useRef([]);

  /* ================= LAZY VIDEO ================= */
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target;

          if (entry.isIntersecting) {
            if (!video.src) video.src = video.dataset.src; // ✅ load only when visible
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    feedRef.current.forEach(v => v && observer.observe(v));

    return () => {
      feedRef.current.forEach(v => v && observer.unobserve(v));
    };
  }, [posts]);

  /* ================= URL FIX ================= */
  const fixUrl = (url, fallback) => {
    if (!url) return `${API_BASE}${fallback}`;
    return url.startsWith("http") ? url : `${API_BASE}${url}`;
  };

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!token) navigate("/login");

    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoadingPosts(true);

        const [userData, postsData] = await Promise.all([
          fetchWithToken(`${API_BASE}/api/users/${finalUserId}`, token),
          fetchWithToken(
            `${API_BASE}/api/posts/user/${finalUserId}?limit=10&page=1`,
            token
          ),
        ]);

        if (!isMounted) return;

        setUser(userData);
        setBio(userData.bio || "");
        setIntro(userData.intro || "");

        const followerIds = (userData.followers || []).map(f =>
          typeof f === "object" ? f._id : f
        );
        setIsFollowing(followerIds.includes(currentUserId));

        const fixedPosts = postsData.map(post => ({
          _id: post._id,
          content: post.content,
          likes: post.likes || [],
          comments: post.comments || [],
          media: post.media?.map(m => ({
            url: m.url.startsWith("http") ? m.url : `${API_BASE}${m.url}`,
            type: m.type,
            isReel: m.isReel,
          })),
          user: {
            name: post.user?.name,
            profilePic: fixUrl(
              post.user?.profilePic,
              "/uploads/profiles/default-profile.png"
            ),
          },
        }));

        setPosts(fixedPosts);
      } catch (err) {
        console.error("FETCH PROFILE ERROR:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [finalUserId, token, currentUserId, navigate]);

  /* ================= ACTIONS ================= */
  const handleFollow = async () => {
    try {
      await fetchWithToken(
        `${API_BASE}/api/users/${finalUserId}/follow`,
        token,
        { method: "PUT" }
      );
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("FOLLOW ERROR:", err);
    }
  };

  const handleLike = async (postId) => {
    try {
      await fetchWithToken(
        `${API_BASE}/api/posts/${postId}/like`,
        token,
        { method: "PUT" }
      );

      setPosts(prev =>
        prev.map(p =>
          p._id === postId
            ? {
                ...p,
                likes: p.likes.includes(currentUserId)
                  ? p.likes.filter(id => id !== currentUserId)
                  : [...p.likes, currentUserId],
              }
            : p
        )
      );
    } catch (err) {
      console.error("LIKE ERROR:", err);
    }
  };

  const handleComment = async (postId, text) => {
    try {
      const { comment } = await fetchWithToken(
        `${API_BASE}/api/posts/${postId}/comment`,
        token,
        {
          method: "POST",
          body: JSON.stringify({ text }),
          headers: { "Content-Type": "application/json" },
        }
      );

      setPosts(prev =>
        prev.map(p =>
          p._id === postId
            ? { ...p, comments: [...p.comments, comment] }
            : p
        )
      );
    } catch (err) {
      console.error("COMMENT ERROR:", err);
    }
  };

  const handleUpdateProfile = async () => {
    if (!token) return;

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("bio", bio);
      formData.append("intro", intro);

      const updatedUser = await fetchWithToken(
        `${API_BASE}/api/users/${finalUserId}`,
        token,
        { method: "PUT", body: formData }
      );

      setUser(updatedUser.user || updatedUser);
      setIsEditing(false);
    } catch (err) {
      console.error("UPDATE PROFILE ERROR:", err);
    } finally {
      setSaving(false);
    }
  };

  const reelPosts = posts.filter(p =>
    p.media?.some(m => m.isReel)
  );

  /* ================= POST ITEM ================= */
  const PostItem = ({ post, idx }) => (
    <div className="bg-white rounded shadow overflow-hidden">
      {post.media?.length > 0 && (
        <div className="flex overflow-x-auto snap-x snap-mandatory">
          {post.media.map((m, i) => (
            <div key={i} className="flex-shrink-0 w-full h-64 relative snap-start">
              {m.type === "image" ? (
                <img src={m.url} className="w-full h-full object-cover" />
              ) : (
                <>
                  <video
                    ref={el => (feedRef.current[idx * 10 + i] = el)}
                    data-src={m.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="none"
                    controls
                  />
                  {m.isReel && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                      Reel
                    </span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <PostCard
        post={post}
        onLike={handleLike}
        onComment={handleComment}
        currentUserId={currentUserId}
      />
    </div>
  );

  if (!user) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="container mx-auto py-6 px-2 md:px-6 space-y-6">
      {/* COVER */}
      <div className="w-full h-40 md:h-56 bg-gray-200 rounded overflow-hidden relative">
        <img
          src={fixUrl(user.coverPhoto, "/uploads/profiles/default-cover.png")}
          className="w-full h-full object-cover"
        />
      </div>

      {/* PROFILE */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <img
            src={fixUrl(user.profilePic, "/uploads/profiles/default-profile.png")}
            className="w-24 h-24 rounded-full object-cover"
          />

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p>{user.intro}</p>
            <p className="text-gray-500">{user.bio}</p>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          {finalUserId === currentUserId ? (
            <button onClick={() => setIsEditing(!isEditing)} className="px-6 py-2 bg-blue-500 text-white rounded">
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          ) : (
            <button onClick={handleFollow} className="px-6 py-2 bg-blue-500 text-white rounded">
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
          posts.map((p, i) => <PostItem key={p._id} post={p} idx={i} />)
        )}
      </div>
    </div>
  );
};

export default Profile;