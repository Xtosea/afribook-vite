import React, {
  useEffect,
  useRef,
  useState,
  Suspense,
  lazy,
  memo,
  useCallback,
} from "react";

import { useNavigate } from "react-router-dom";

import SidebarLeft from "../components/layout/SidebarLeft";
import SidebarRight from "../components/layout/SidebarRight";
import StoryBar from "../components/stories/StoryBar";

import { API_BASE, fetchWithToken } from "../api/api";

import {
  getSocket,
  connectSocket,
} from "../socket";


import Adsterra from "../components/Adsterra.jsx";

import SuggestedFriends from "../components/friends/SuggestedFriends";

import ReelsHorizontal from "../components/reels/ReelsHorizontal";

import FeedSection from "../components/feed/FeedSection";
import TopCreators from "../components/feed/TopCreators";
import ChallengesWidget from "../components/feed/ChallengesWidget";

// Lazy Components
const PostCard = lazy(() =>
  import("../components/PostCard")
);

// ================= SKELETON =================

const SkeletonPost = memo(() => (
  <div className="bg-white p-4 rounded-2xl shadow animate-pulse space-y-4">
    <div className="h-64 bg-gray-300 rounded-xl"></div>
  </div>
));

// ================= HOME =================

const Home = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const currentUserId =
    localStorage.getItem("userId");

  const currentUser = {
    _id: currentUserId,
    profilePic:
      localStorage.getItem("profilePic"),
    name: localStorage.getItem("name"),
  };

  // ================= STATES =================

  const [posts, setPosts] = useState([]);

  const [stories, setStories] = useState([]);

  const [reels, setReels] = useState([]);

  const [loadingPosts, setLoadingPosts] =
  useState(true);

const [page, setPage] = useState(1);

const [hasMore, setHasMore] =
  useState(true);

const observer = useRef(null);


  const feedRef = useRef(null);

  // ================= AUTH =================

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // ================= FETCH FEED =================

  useEffect(() => {
  if (!token) return;

  let mounted = true;

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);

      const postsData = await fetchWithToken(
        `${API_BASE}/api/posts?page=${page}&limit=5`,
        token
      );

      if (!mounted) return;

      const newPosts = Array.isArray(postsData)
        ? postsData
        : [];

      setPosts((prev) =>
        page === 1
          ? newPosts
          : [...prev, ...newPosts]
      );

      if (newPosts.length < 10) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Posts error:", err);
    } finally {
      if (mounted) {
        setLoadingPosts(false);
      }
    }
  };

  fetchPosts();

  return () => {
    mounted = false;
  };
}, [token, page]);


useEffect(() => {
  if (!token) return;

  const fetchStories = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/stories?limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setStories(data?.stories || []);
    } catch (err) {
      console.error("Stories error:", err);
    }
  };

  fetchStories();
}, [token]);


useEffect(() => {
  const fetchReels = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/posts/reels`
      );

      const data = await res.json();

      setReels(
        Array.isArray(data)
          ? data
          : data?.reels || []
      );
    } catch (err) {
      console.error("Reels error:", err);
    }
  };

  fetchReels();
}, []);


  // ================= SOCKET =================

  useEffect(() => {
    if (!token) return;

    if (!getSocket()) {
      connectSocket();
    }

    const socket = getSocket();

    if (!socket) return;

    const handleNewPost = (post) => {
      setPosts((prev) => {
        const exists = prev.some(
          (p) => p._id === post._id
        );

        if (exists) return prev;

        return [post, ...prev];
      });
    };

    const handleNewStory = (story) => {
      setStories((prev) => [
        story,
        ...prev,
      ]);
    };

    socket.on("new-post", handleNewPost);

    socket.on(
      "new-story",
      handleNewStory
    );

    return () => {
      socket.off(
        "new-post",
        handleNewPost
      );

      socket.off(
        "new-story",
        handleNewStory
      );
    };
  }, [token]);



// ================= INFINITE SCROLL =================

const lastPostRef = useCallback(
  (node) => {
    if (loadingPosts) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current =
      new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore
        ) {
          setPage((prev) => prev + 1);
        }
      });

    if (node) {
      observer.current.observe(node);
    }
  },
  [loadingPosts, hasMore]
);


  // ================= RENDER =================

  return (
    <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto px-2">

      {/* LEFT SIDEBAR */}

      <aside className="hidden md:block md:col-span-1">
        <SidebarLeft />
      </aside>

      {/* MAIN FEED */}

      <main className="md:col-span-2 space-y-4">

         {/* POST COMPOSER */}

<div className="bg-white p-4 rounded-2xl shadow">
  <div className="flex items-center gap-3">
    <img
      src={
        currentUser?.profilePic ||
        "/default-avatar.png"
      }
      alt=""
      className="w-12 h-12 rounded-full"
    />

    <textarea
      placeholder="Share a photo, video or thought..."
      onFocus={() => navigate("/create-post")}
      readOnly
      className="
        flex-1
        bg-gray-100
        rounded-full
        px-4
        py-3
        resize-none
        cursor-pointer
      "
    />
  </div>
</div>

       {/* STORIES */}

           <StoryBar
          user={currentUser}
          stories={stories}
        />

        
{/* POSTS */}

<div
  ref={feedRef}
  className="space-y-4"
>
  {loadingPosts && page === 1 ? (
    <>
      <SkeletonPost />
      <SkeletonPost />
    </>
  ) : (
    posts.map((post, index) => {
  const isLastPost =
    posts.length === index + 1;

  return (
    <div
      key={post._id}
      ref={isLastPost ? lastPostRef : null}
    >
      <Suspense fallback={<SkeletonPost />}>
        <PostCard
          post={post}
          currentUserId={currentUserId}
        />
      </Suspense>


      {(index + 1) === 2 &&
        reels.length > 0 && (
          <FeedSection title="🎬 Trending Reels">
            <ReelsHorizontal reels={reels} />
          </FeedSection>
      )}


      {(index + 1) === 4 && (
        <FeedSection title="👥 People You May Know">
          <SuggestedFriends limit={10} />
        </FeedSection>
      )}


      {(index + 1) === 6 && (
        <FeedSection title="📢 Sponsored">
          <Adsterra containerId="feed-ad-1" />
        </FeedSection>
      )}


      {(index + 1) === 8 && (
        <FeedSection title="⭐ Top Creators">
          <TopCreators />
        </FeedSection>
      )}


      {(index + 1) === 10 && (
        <FeedSection title="🏆 Active Challenges">
          <ChallengesWidget />
        </FeedSection>
      )}


      {(index + 1) === 12 &&
        reels.length > 0 && (
          <FeedSection title="🎬 More Reels">
            <ReelsHorizontal reels={reels} />
          </FeedSection>
      )}

        </div>
      );
    })
  )}

  {loadingPosts && page > 1 && (
    <div className="text-center py-4">
      Loading more posts...
    </div>
  )}
</div>

   </main>

      {/* RIGHT SIDEBAR */}

      <aside className="hidden md:block md:col-span-1 space-y-4">

        <SidebarRight />

       </aside>
     
   </div>
  );
};

export default memo(Home);