import React, {
  useState,
  useEffect,
  useRef,
  memo,
} from "react";

import { API_BASE, fetchWithToken } from "../../api/api";
import { getSocket } from "../../socket";

const STORY_TIME = 5000;

const PhotosSection = ({ posts = [], user = {}, token }) => {

  const socket = getSocket();

  const safePosts = Array.isArray(posts)
    ? posts
    : [];

  /* ================= STATES ================= */

  const [activeIndex, setActiveIndex] =
    useState(null);

  const [comments, setComments] =
    useState([]);

  const [commentText, setCommentText] =
    useState("");

  const [likesMap, setLikesMap] =
    useState({});

  const [sharesMap, setSharesMap] =
    useState({});

  const [loadingComments, setLoadingComments] =
    useState(false);

  const [likeAnimation, setLikeAnimation] =
    useState(false);

  const timerRef = useRef(null);
  const lastTapRef = useRef(0);

  /* ================= EXTRACT IMAGES ================= */

  const images = safePosts.flatMap((post) => {

    const media = Array.isArray(post.media)
      ? post.media
      : [];

    return media
      .filter((m) => m?.type === "image")
      .map((m) => ({
        ...m,
        postId: post._id,
        post,
      }));
  });

  /* ================= INIT COUNTS ================= */

  useEffect(() => {

    const likesObj = {};
    const sharesObj = {};

    safePosts.forEach((post) => {

      likesObj[post._id] =
        Array.isArray(post.likes)
          ? post.likes.length
          : 0;

      sharesObj[post._id] =
        post.shares || 0;

    });

    setLikesMap(likesObj);
    setSharesMap(sharesObj);

  }, [safePosts]);

  /* ================= SOCKET REALTIME ================= */

  useEffect(() => {

    if (!socket) return;

    socket.on("photo-like", ({
      photoId,
      likesCount,
    }) => {

      setLikesMap((prev) => ({
        ...prev,
        [photoId]: likesCount,
      }));

    });

    socket.on("photo-share", ({
      photoId,
      shares,
    }) => {

      setSharesMap((prev) => ({
        ...prev,
        [photoId]: shares,
      }));

    });

    socket.on("photo-comment", ({
      comment,
    }) => {

      setComments((prev) => [
        comment,
        ...prev,
      ]);

    });

    return () => {

      socket.off("photo-like");
      socket.off("photo-share");
      socket.off("photo-comment");

    };

  }, [socket]);

  /* ================= AUTO STORY PLAY ================= */

  useEffect(() => {

    if (activeIndex === null) return;

    timerRef.current = setTimeout(() => {

      nextImage();

    }, STORY_TIME);

    return () =>
      clearTimeout(timerRef.current);

  }, [activeIndex]);

  /* ================= OPEN IMAGE ================= */

  const openImage = async (index) => {

    setActiveIndex(index);

    try {

      setLoadingComments(true);

      const img = images[index];

      const data = await fetchWithToken(
        `${API_BASE}/api/photos/${img.postId}/comments`,
        token
      );

      setComments(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(err);

    } finally {

      setLoadingComments(false);

    }

  };

  /* ================= NAVIGATION ================= */

  const nextImage = () => {

    setActiveIndex((prev) => {

      if (
        prev < images.length - 1
      ) {
        return prev + 1;
      }

      return prev;

    });

  };

  const prevImage = () => {

    setActiveIndex((prev) => {

      if (prev > 0) {
        return prev - 1;
      }

      return prev;

    });

  };

  /* ================= LIKE ================= */

  const handleLike = async (img) => {

    try {

      // optimistic update
      setLikesMap((prev) => ({
        ...prev,
        [img.postId]:
          (prev[img.postId] || 0) + 1,
      }));

      setLikeAnimation(true);

      setTimeout(() => {
        setLikeAnimation(false);
      }, 800);

      const data =
        await fetchWithToken(
          `${API_BASE}/api/photos/${img.postId}/like`,
          token,
          {
            method: "POST",
          }
        );

      if (data.likesCount !== undefined) {

        setLikesMap((prev) => ({
          ...prev,
          [img.postId]:
            data.likesCount,
        }));

      }

    } catch (err) {

      console.error(err);

    }

  };

  /* ================= DOUBLE TAP ================= */

  const handleDoubleTap = (img) => {

    const now = Date.now();

    if (
      now - lastTapRef.current <
      300
    ) {

      handleLike(img);

    }

    lastTapRef.current = now;

  };

  /* ================= SHARE ================= */

  const handleShare = async (img) => {

    try {

      const data =
        await fetchWithToken(
          `${API_BASE}/api/photos/${img.postId}/share`,
          token,
          {
            method: "POST",
          }
        );

      setSharesMap((prev) => ({
        ...prev,
        [img.postId]:
          data.shares || 0,
      }));

      if (
        navigator.share
      ) {

        navigator.share({
          title: "Afribook Photo",
          url: img.url,
        });

      }

    } catch (err) {

      console.error(err);

    }

  };

  /* ================= COMMENT ================= */

  const sendComment = async () => {

    if (
      !commentText.trim()
    ) return;

    try {

      const img =
        images[activeIndex];

      const newComment =
        await fetchWithToken(
          `${API_BASE}/api/photos/${img.postId}/comment`,
          token,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              text: commentText,
            }),
          }
        );

      setComments((prev) => [
        newComment,
        ...prev,
      ]);

      setCommentText("");

    } catch (err) {

      console.error(err);

    }

  };

  return (
    <div className="space-y-6">

      {/* ================= PROFILE MEDIA ================= */}

      <div className="bg-white rounded-2xl shadow p-4">

        <h2 className="text-xl font-bold mb-4">
          Profile Media
        </h2>

        <div className="flex gap-4 overflow-x-auto pb-2">

          {user.profilePic && (
            <img
              src={user.profilePic}
              loading="lazy"
              onClick={() =>
                setActiveIndex(0)
              }
              className="w-32 h-32 rounded-2xl object-cover cursor-pointer hover:scale-105 transition"
            />
          )}

          {user.coverPhoto && (
            <img
              src={user.coverPhoto}
              loading="lazy"
              className="w-32 h-32 rounded-2xl object-cover cursor-pointer hover:scale-105 transition"
            />
          )}

        </div>

      </div>

      {/* ================= GRID ================= */}

      <div className="bg-white rounded-2xl shadow p-4">

        <h2 className="text-xl font-bold mb-4">
          Photos
        </h2>

        {images.length === 0 ? (

          <p className="text-gray-500">
            No photos yet
          </p>

        ) : (

          <div className="grid grid-cols-3 gap-2">

            {images.map((img, i) => (

              <div
                key={i}
                className="relative group"
              >

                <img
                  src={img.url}
                  loading="lazy"
                  onClick={() =>
                    openImage(i)
                  }
                  className="h-36 w-full object-cover rounded-xl cursor-pointer"
                />

                {/* overlay */}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-5 text-white">

                  <button
                    onClick={() =>
                      handleLike(img)
                    }
                  >
                    ❤️
                  </button>

                  <button
                    onClick={() =>
                      openImage(i)
                    }
                  >
                    💬
                  </button>

                  <button
                    onClick={() =>
                      handleShare(img)
                    }
                  >
                    🔗
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* ================= FULLSCREEN ================= */}

      {activeIndex !== null &&
        images[activeIndex] && (

        <div className="fixed inset-0 bg-black z-50 flex">

          {/* IMAGE SIDE */}

          <div
            className="flex-1 flex items-center justify-center relative"
            onClick={() =>
              handleDoubleTap(
                images[activeIndex]
              )
            }
          >

            <img
              src={
                images[
                  activeIndex
                ].url
              }
              className="max-h-[90vh] object-contain"
            />

            {/* like anim */}

            {likeAnimation && (

              <div className="absolute text-8xl animate-ping">
                ❤️
              </div>

            )}

            {/* progress */}

            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700">

              <div
                className="h-1 bg-white transition-all duration-[5000ms]"
                style={{
                  width: "100%",
                }}
              />

            </div>

            {/* nav */}

            <button
              onClick={prevImage}
              className="absolute left-3 text-white text-4xl"
            >
              ◀
            </button>

            <button
              onClick={nextImage}
              className="absolute right-3 text-white text-4xl"
            >
              ▶
            </button>

            {/* close */}

            <button
              onClick={() =>
                setActiveIndex(null)
              }
              className="absolute top-4 right-4 text-white text-2xl"
            >
              ✖
            </button>

          </div>

          {/* COMMENTS PANEL */}

          <div className="w-[380px] bg-white flex flex-col">

            {/* top */}

            <div className="p-4 border-b">

              <div className="flex justify-between items-center">

                <h2 className="font-bold">
                  Comments
                </h2>

                <div className="flex gap-4">

                  <span>
                    ❤️{" "}
                    {likesMap[
                      images[
                        activeIndex
                      ].postId
                    ] || 0}
                  </span>

                  <span>
                    🔗{" "}
                    {sharesMap[
                      images[
                        activeIndex
                      ].postId
                    ] || 0}
                  </span>

                </div>

              </div>

            </div>

            {/* comments */}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">

              {loadingComments ? (

                <p>
                  Loading...
                </p>

              ) : comments.length ===
                0 ? (

                <p className="text-gray-500">
                  No comments yet
                </p>

              ) : (

                comments.map(
                  (c, i) => (

                    <div
                      key={i}
                      className="border-b pb-2"
                    >

                      <div className="flex gap-2 items-center">

                        <img
                          src={
                            c.user
                              ?.profilePic
                          }
                          className="w-8 h-8 rounded-full object-cover"
                        />

                        <div>

                          <p className="font-semibold text-sm">
                            {
                              c.user
                                ?.name
                            }
                          </p>

                          <p className="text-sm">
                            {
                              c.text
                            }
                          </p>

                        </div>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

            {/* input */}

            <div className="p-3 border-t flex gap-2">

              <input
                value={
                  commentText
                }
                onChange={(e) =>
                  setCommentText(
                    e.target.value
                  )
                }
                placeholder="Write comment..."
                className="flex-1 border rounded-xl p-2"
              />

              <button
                onClick={
                  sendComment
                }
                className="bg-blue-500 text-white px-4 rounded-xl"
              >
                Send
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default memo(PhotosSection);