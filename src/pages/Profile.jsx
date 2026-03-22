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

  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const finalUserId = userId || currentUserId;

  const feedRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target;
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        });
      },
      { threshold: 0.5 }
    );

    feedRef.current.forEach(v => v && observer.observe(v));
    return () => feedRef.current.forEach(v => v && observer.unobserve(v));
  }, [posts]);

  const fixUrl = (url, fallback) => {
    if (!url) return `${API_BASE}${fallback}`;
    return url.startsWith("http") ? url : `${API_BASE}${url}`;
  };

  useEffect(() => {
    if (!token) navigate("/login");

    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const [userData, postsData] = await Promise.all([
          fetchWithToken(`${API_BASE}/api/users/${finalUserId}`, token),
          fetchWithToken(`${API_BASE}/api/posts/user/${finalUserId}`, token),
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
          ...post,
          media: post.media?.map(m => ({
            ...m,
            url: m.url.startsWith("http") ? m.url : `${API_BASE}${m.url}`,
            isReel: m.isReel || (m.type === "video" && post.media.length === 1),
          })),
          user: {
            ...post.user,
            profilePic: post.user?.profilePic
              ? fixUrl(post.user.profilePic, "/uploads/profiles/default-profile.png")
              : `${API_BASE}/uploads/profiles/default-profile.png`,
          },
        }));

        setPosts(fixedPosts);
      } catch (err) {
        console.error("FETCH PROFILE ERROR:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      }
    };

    fetchProfile();

    return () => { isMounted = false };
  }, [finalUserId, token, currentUserId, navigate]);

  const handleFollow = async () => {
    try {
      await fetchWithToken(`${API_BASE}/api/users/${finalUserId}/follow`, token, { method: "PUT" });
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("FOLLOW ERROR:", err);
    }
  };

  const handleLike = async (postId) => {
    try {
      await fetchWithToken(`${API_BASE}/api/posts/${postId}/like`, token, { method: "PUT" });
      setPosts(prev =>
        prev.map(p =>
          p._id === postId
            ? {
                ...p,
                likes: p.likes.includes(currentUserId)
                  ? p.likes.filter(id => id !== currentUserId)
                  : [...(p.likes || []), currentUserId],
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
            ? { ...p, comments: [...(p.comments || []), comment] }
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
        {
          method: "PUT",
          body: formData,
        }
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

  const PostItem = ({ post, idx }) => (
    <div className="bg-white rounded shadow overflow-hidden">
      {post.media && post.media.length > 0 && (
        <div className="flex overflow-x-auto snap-x snap-mandatory">
          {post.media.map((m, i) => (
            <div key={i} className="flex-shrink-0 w-full h-64 relative snap-start">
              {m.type === "image" ? (
                <img src={m.url} className="w-full h-full object-cover" />
              ) : (
                <>
                  <video
                    src={m.url}
                    className="w-full h-full object-cover"
                    muted
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
        {isEditing && (
          <div className="absolute top-2 left-2 bg-white p-2 rounded shadow">
            <CoverPicUploader onUploaded={(url) => setUser(prev => ({ ...prev, coverPhoto: url }))} />
          </div>
        )}
      </div>

      {/* PROFILE */}
      <div className="bg-white p-4 rounded shadow space-y-4">

        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">

          <img
            src={fixUrl(user.profilePic, "/uploads/profiles/default-profile.png")}
            className="w-24 h-24 rounded-full object-cover"
          />

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{user.name}</h1>

            <p>{user.intro}</p>
            <p className="text-gray-500">{user.bio}</p>

            <div className="flex justify-center md:justify-start gap-4 mt-3 text-sm">
              <span>{user.points || 0} points</span>

              <span className="cursor-pointer" onClick={() => {setModalType("followers"); setShowModal(true);}}>
                {user.followers?.length || 0} Followers
              </span>

              <span className="cursor-pointer" onClick={() => {setModalType("following"); setShowModal(true);}}>
                {user.following?.length || 0} Following
              </span>
            </div>
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

      {/* TABS */}
      <div className="bg-white rounded shadow flex justify-around py-3 text-sm font-semibold">
        <button onClick={() => setActiveTab("posts")} className={activeTab === "posts" ? "text-blue-500" : "text-gray-500"}>Posts</button>
        <button onClick={() => setActiveTab("reels")} className={activeTab === "reels" ? "text-blue-500" : "text-gray-500"}>Reels</button>
        <button onClick={() => setActiveTab("about")} className={activeTab === "about" ? "text-blue-500" : "text-gray-500"}>About</button>
      </div>

      {/* CONTENT */}
      <div className="space-y-6">
        {activeTab === "posts" && posts.map((p,i)=><PostItem key={p._id} post={p} idx={i}/>)}
        {activeTab === "reels" && reelPosts.map((p,i)=><PostItem key={p._id} post={p} idx={i}/>)}
        {activeTab === "about" && (
          <div className="bg-white p-4 rounded shadow">
            <p><b>Name:</b> {user.name}</p>
            <p><b>Intro:</b> {user.intro}</p>
            <p><b>Bio:</b> {user.bio}</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-11/12 md:w-1/3 rounded p-4">
            <h2 className="font-bold mb-3">{modalType}</h2>
            {(user[modalType] || []).map((u,i)=>(
              <div key={i} className="flex justify-between items-center mb-2">
                <span>{u.name}</span>
                <button onClick={()=>navigate(`/profile/${u._id}`)} className="text-blue-500">View</button>
              </div>
            ))}
            <button onClick={()=>setShowModal(false)} className="mt-4">Close</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;