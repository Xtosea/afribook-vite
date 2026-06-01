import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  API_BASE,
  fetchWithToken,
} from "../api/api";

import PostMenu from "./PostMenu";

import renderContentWithLinks from "../utils/renderContentWithLinks";

import LinkPreview from "./LinkPreview";

import extractUrls from "../utils/extractUrls";
import {
  Repeat2,
  ThumbsUp,
  MessageCircle,
  Share2,
} from "lucide-react";
import { BadgeCheck } from "lucide-react";


const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

const PostCard = ({
  post,
  currentUserId,
  onDeleted,
  onUpdated,
}) => {

  const navigate = useNavigate();

  const videoRefs = useRef([]);

  const observerRef = useRef(null);

  // ================= MEDIA =================

  const media = Array.isArray(
    post?.media
  )
    ? post.media
    : [];

  const isMulti =
    media.length > 1;

  // ================= STATE =================

  const [likes, setLikes] =
    useState(
      Array.isArray(post?.likes)
        ? post.likes
        : []
    );

  const [comments, setComments] =
    useState(
      Array.isArray(post?.comments)
        ? post.comments
        : []
    );

  const [shares, setShares] =
    useState(post?.shares || 0);

  const [commentText, setCommentText] =
    useState("");

  const [showComments, setShowComments] =
    useState(false);

  const [liking, setLiking] =
    useState(false);

  // ================= AUTH =================

  const token =
    localStorage.getItem("token");

  const likedByUser =
    likes.includes(currentUserId);

  // ================= URLS =================

  const urls = extractUrls(
    post?.content || ""
  );

  // ================= LIKE =================

  const handleLike = async () => {

    if (liking) return;

    setLiking(true);

    try {

      const res =
        await fetchWithToken(
          `${API_BASE}/api/posts/${post?._id}/like`,
          token,
          {
            method: "POST",
          }
        );

      if (res?.likes) {

        setLikes(res.likes);

      }

    } catch (err) {

      console.error(
        "Like error:",
        err
      );

    } finally {

      setLiking(false);

    }
  };

  // ================= COMMENT =================

  const handleComment = async () => {

    if (!commentText.trim())
      return;

    try {

      const res =
        await fetchWithToken(
          `${API_BASE}/api/posts/${post?._id}/comment`,
          token,
          {
            method: "POST",

            body: JSON.stringify({
              text: commentText,
            }),

            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

      if (res?.comments) {

        setComments(
          res.comments
        );

      }

      setCommentText("");

    } catch (err) {

      console.error(
        "Comment error:",
        err
      );

    }
  };

  // ================= SHARE =================

  const handleShare = async () => {

    try {

      const url =
        `https://afribook-backend.onrender.com/post/${post?._id}`;

      const text =
        post?.content ||
        "Check this post";

      if (navigator.share) {

        await navigator.share({
          title:
            post?.user?.name ||
            "Post",

          text,

          url,
        });

      } else {

        await navigator.clipboard.writeText(
          url
        );

        alert("Link copied");

      }

      const res =
        await fetchWithToken(
          `${API_BASE}/api/posts/${post?._id}/share`,
          token,
          {
            method: "POST",
          }
        );

      if (
        res?.shares !== undefined
      ) {

        setShares(
          res.shares
        );

      }

    } catch (err) {

      console.error(
        "Share error:",
        err
      );

    }
  };

  // ================= SHARE TO FEED =================

  const shareToFeed =
    async () => {

      try {

        const res =
          await fetchWithToken(
            `${API_BASE}/api/posts/${post._id}/share-to-feed`,
            token,
            {
              method: "POST",
            }
          );

        if (res?.post) {

          onUpdated?.(
            res.post
          );

          alert(
            "Shared to feed"
          );

        }

      } catch (err) {

        console.error(
          "Share to feed error:",
          err
        );

      }
    };

  // ================= PROFILE =================

  const goToProfile =
    useCallback(() => {

      if (
        !post?.user?._id
      )
        return;

      navigate(
        `/profile/${post.user._id}`
      );

    }, [navigate, post]);

  // ================= VIDEO AUTOPLAY =================

  useEffect(() => {

    if (!media.length)
      return;

    observerRef.current =
      new IntersectionObserver(
        (entries) => {

          entries.forEach(
            (entry) => {

              const video =
                entry.target;

              if (
                entry.isIntersecting &&
                entry.intersectionRatio >=
                  0.7
              ) {

                videoRefs.current.forEach(
                  (v) => {

                    if (
                      v &&
                      v !== video
                    ) {

                      v.pause();

                      v.muted = true;

                    }
                  }
                );

                video.muted = false;

                video
                  .play()
                  .catch(() => {});

              } else {

                video.pause();

                video.muted = true;

              }
            }
          );
        },
        {
          threshold: [
            0,
            0.7,
            1,
          ],
        }
      );

    videoRefs.current.forEach(
      (v) => {

        if (
          v &&
          observerRef.current
        ) {

          observerRef.current.observe(
            v
          );

        }
      }
    );

    return () => {

      if (
        observerRef.current
      ) {

        videoRefs.current.forEach(
          (v) => {

            if (v) {

              observerRef.current.unobserve(
                v
              );

            }
          }
        );
      }
    };

  }, [media]);

console.log(post.user);
  // ================= RENDER =================

return (
  <div className="bg-white rounded-xl shadow p-3 space-y-3">

    {/* HEADER */}
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <img
          src={post?.user?.profilePic || defaultProfile}
          onClick={goToProfile}
          className="w-14 h-14 rounded-full object-cover cursor-pointer"
          alt=""
          loading="lazy"
        />

        <div>

          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={goToProfile}
          >
            <p className="font-semibold">
              {post?.user?.name || "User"}
            </p>

            {post?.user?.verified && (
              <BadgeCheck
                size={16}
                className="text-blue-500 fill-blue-500"
              />
            )}
          </div>

          <p className="text-xs text-gray-500">
            {post?.createdAt
              ? new Date(post.createdAt).toLocaleString()
              : ""}
          </p>

        </div>

      </div>

      <PostMenu
        post={post}
        token={token}
        currentUser={{
          _id: currentUserId,
        }}
        onDeleted={onDeleted}
        onUpdated={onUpdated}
      />

    </div>



     {/* TEXT */}

      {post?.content && (

        <div className="space-y-3">

          <div className="px-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed">

            {renderContentWithLinks(
              post.content
            )}

          </div>

          {/* URL PREVIEWS */}

          {urls.length > 0 && (

            <div className="space-y-3">

              {urls.map(
                (
                  url,
                  index
                ) => (

                  <LinkPreview
                    key={`${url}-${index}`}
                    url={url}
                  />

                )
              )}

            </div>

          )}

        </div>

      )}

      {/* MEDIA */}

      {media.length > 0 && (

        <div
          className={
            isMulti
              ? "grid grid-cols-2 gap-2"
              : ""
          }
        >

          {media.map(
            (m, i) =>

              m.type ===
              "video" ? (

                <video
                  key={i}
                  ref={(el) =>
                    (
                      videoRefs.current[
                        i
                      ] = el
                    )
                  }
                  src={m.url}
                  controls
                  preload="none"
                  playsInline
                  className="w-full rounded-xl bg-black max-h-[600px] object-cover"
                />

              ) : (

                <img
                  key={i}
                  src={m.url}
                  loading="lazy"
                  className="w-full rounded-xl object-cover max-h-[700px]"
                  alt=""
                />

              )
          )}

        </div>

      )}

      {/* ACTIONS */}

<div className="grid grid-cols-4 border-t border-gray-200 pt-2">

  {/* SHARE TO FEED */}
  <button
    onClick={shareToFeed}
    className="flex flex-col items-center justify-center py-2 hover:bg-gray-100 rounded-lg transition"
  >
    <Repeat2 size={20} />
    <span className="text-xs mt-1">
      Share to Feed
    </span>
  </button>

  {/* LIKE */}
  <button
    onClick={handleLike}
    disabled={liking}
    className={`flex flex-col items-center justify-center py-2 rounded-lg transition ${
      likedByUser
        ? "text-blue-600"
        : "hover:bg-gray-100"
    }`}
  >
    <ThumbsUp size={20} />
    <span className="text-xs mt-1">
      Like ({likes.length})
    </span>
  </button>

  {/* COMMENT */}
  <button
    onClick={() =>
      setShowComments(!showComments)
    }
    className="flex flex-col items-center justify-center py-2 hover:bg-gray-100 rounded-lg transition"
  >
    <MessageCircle size={20} />
    <span className="text-xs mt-1">
      Comment ({comments.length})
    </span>
  </button>

  {/* SHARE */}
  <button
    onClick={handleShare}
    className="flex flex-col items-center justify-center py-2 hover:bg-gray-100 rounded-lg transition"
  >
    <Share2 size={20} />
    <span className="text-xs mt-1">
      Share ({shares})
    </span>
  </button>

</div>

      {/* COMMENTS */}

      {showComments && (

        <div className="space-y-3 border-t pt-3">

          {/* COMMENT LIST */}

          {comments.map(
            (c, i) => (

              <div
                key={i}
                className="bg-gray-100 p-2 rounded-xl text-sm"
              >

                <span className="font-semibold">
                  {c?.user
                    ?.name ||
                    "User"}
                </span>

                <span className="ml-2">
                  {c?.text}
                </span>

              </div>
            )
          )}

          {/* COMMENT INPUT */}

          <div className="flex gap-2">

            <input
              value={
                commentText
              }
              onChange={(
                e
              ) =>
                setCommentText(
                  e.target.value
                )
              }
              className="flex-1 border p-2 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Write comment..."
            />

            <button
              onClick={
                handleComment
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl"
            >
              Send
            </button>

          </div>

        </div>

      )}

    </div>
  );
};

export default React.memo(
  PostCard
);