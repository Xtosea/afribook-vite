import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  Suspense,
  lazy,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchWithToken, API_BASE } from "../api/api";

// Lazy-load components
const PostCard = lazy(() => import("../components/PostCard"));
const ProfileHeader = lazy(() => import("../components/profile/ProfileHeader"));
const ProfileTabs = lazy(() => import("../components/profile/ProfileTabs"));
const EditProfileModal = lazy(() =>
  import("../components/profile/EditProfileModal")
);
const AboutSection = lazy(() => import("../components/profile/AboutSection"));
const PhotosSection = lazy(() => import("../components/profile/PhotosSection"));
const FriendsSection = lazy(() => import("../components/profile/FriendsSection"));
const VideosSection = lazy(() => import("../components/profile/VideosSection"));
const ReelsSection = lazy(() => import("../components/profile/ReelsSection"));
const FollowersSection = lazy(() =>
  import("../components/profile/FollowersSection")
);
const FollowingSection = lazy(() =>
  import("../components/profile/FollowingSection")
);
const MutualFriendsSection = lazy(() =>
  import("../components/profile/MutualFriendsSection")
);

const POSTS_LIMIT = 10;

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");
  const finalUserId = userId || currentUserId;

  // STATES
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [videos, setVideos] = useState([]);
  const [reels, setReels] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [mutualFriends, setMutualFriends] = useState([]);

  const [loadingPosts, setLoadingPosts] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("Posts");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  // Infinite scroll for posts
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
  }, [finalUserId, token, navigate]);

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

        if (data.length < POSTS_LIMIT) setHasMore(false);
        setPosts((prev) => [...prev, ...data]);

        const vids = data.filter((p) => p.media?.some((m) => m.type === "video"));
        const reelsData = data.filter((p) => p.isReel || p.reel);

        setVideos((prev) => [...prev, ...vids]);
        setReels((prev) => [...prev, ...reelsData]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [page, finalUserId, token]);

  /* ================= FETCH FOLLOWERS/FOLLOWING ================= */
  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        const data = await fetchWithToken(
          `${API_BASE}/api/users/${finalUserId}`,
          token
        );
        setFollowers(data.followers || []);
        setFollowing(data.following || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFollowData();
  }, [finalUserId, token]);

  /* ================= FETCH MUTUAL FRIENDS ================= */
  useEffect(() => {
    const fetchMutualFriends = async () => {
      try {
        const data = await fetchWithToken(
          `${API_BASE}/api/users/${finalUserId}/mutual`,
          token
        );
        setMutualFriends(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMutualFriends();
  }, [finalUserId, token]);

  if (!user)
    return (
      <div className="p-6 animate-pulse">
        <div className="h-40 bg-gray-200 rounded mb-4" />
      </div>
    );

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* ================= PROFILE HEADER ================= */}
      <Suspense fallback={<div className="h-40 bg-gray-200 animate-pulse rounded mb-4" />}>
        <ProfileHeader
          user={user}
          isOwner={true}
          onEdit={() => setEditing(true)}
          previewProfilePic={previewProfilePic}
          previewCoverPhoto={previewCoverPhoto}
        />
      </Suspense>

      {/* ================= MUTUAL FRIENDS ================= */}
      {!user.isCurrentUser && mutualFriends.length > 0 && (
        <Suspense fallback={<div className="h-10 bg-gray-100 rounded animate-pulse mb-4" />}>
          <MutualFriendsSection mutualFriends={mutualFriends} />
        </Suspense>
      )}

      {/* ================= TABS ================= */}
      <Suspense fallback={<div className="h-12 bg-gray-100 rounded animate-pulse mb-4" />}>
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </Suspense>

      {/* ================= TAB CONTENT ================= */}
      <div className="space-y-4">
        {activeTab === "Posts" && (
          <>
            {posts.map((post, index) =>
              posts.length === index + 1 ? (
                <div ref={lastPostRef} key={post._id}>
                  <Suspense fallback={<div className="h-64 bg-gray-200 rounded mb-4 animate-pulse" />}>
                    <PostCard post={post} currentUserId={currentUserId} />
                  </Suspense>
                </div>
              ) : (
                <Suspense
                  key={post._id}
                  fallback={<div className="h-64 bg-gray-200 rounded mb-4 animate-pulse" />}
                >
                  <PostCard post={post} currentUserId={currentUserId} />
                </Suspense>
              )
            )}
            {loadingPosts && <div className="text-center py-4">Loading...</div>}
          </>
        )}

        {activeTab === "About" && (
          <Suspense fallback={<div className="h-40 bg-gray-100 rounded animate-pulse mb-4" />}>
            <AboutSection user={user} />
          </Suspense>
        )}

        {activeTab === "Photos" && (
          <Suspense fallback={<div className="h-40 bg-gray-100 rounded animate-pulse mb-4" />}>
            <PhotosSection posts={posts} user={user} />
          </Suspense>
        )}

        {activeTab === "Friends" && (
          <Suspense fallback={<div className="h-40 bg-gray-100 rounded animate-pulse mb-4" />}>
            <FriendsSection friends={friends} />
          </Suspense>
        )}

        {activeTab === "Videos" && (
          <Suspense fallback={<div className="h-40 bg-gray-100 rounded animate-pulse mb-4" />}>
            <VideosSection videos={videos} />
          </Suspense>
        )}

        {activeTab === "Reels" && (
          <Suspense fallback={<div className="h-40 bg-gray-100 rounded animate-pulse mb-4" />}>
            <ReelsSection reels={reels} />
          </Suspense>
        )}

        {activeTab === "Followers" && (
          <Suspense fallback={<div className="h-40 bg-gray-100 rounded animate-pulse mb-4" />}>
            <FollowersSection followers={followers} />
          </Suspense>
        )}

        {activeTab === "Following" && (
          <Suspense fallback={<div className="h-40 bg-gray-100 rounded animate-pulse mb-4" />}>
            <FollowingSection following={following} />
          </Suspense>
        )}
      </div>

      {/* ================= EDIT PROFILE MODAL ================= */}
      <Suspense>
        <EditProfileModal
          editing={editing}
          setEditing={setEditing}
          formData={formData}
          previewProfilePic={previewProfilePic}
          previewCoverPhoto={previewCoverPhoto}
          uploading={saving}
        />
      </Suspense>
    </div>
  );
};

export default Profile;