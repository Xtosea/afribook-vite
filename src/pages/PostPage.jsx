import React, {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import { API_BASE } from "../api/api";

const PostPage = () => {

  const { id } =
    useParams();

  const [post, setPost] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // =========================
  // FETCH POST
  // =========================

  useEffect(() => {

    const fetchPost =
      async () => {

        try {

          const res = await fetch(
            `${API_BASE}/api/posts/${id}`
          );

          const data =
            await res.json();

          if (!res.ok) {

            throw new Error(
              data.error ||
              "Post not found"
            );
          }

          setPost(data);

        } catch (err) {

          console.error(err);

        } finally {

          setLoading(false);

        }
      };

    fetchPost();

  }, [id]);

  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (

      <div className="p-6">

        <p className="text-gray-500">
          Loading post...
        </p>

      </div>
    );
  }

  // =========================
  // NOT FOUND
  // =========================

  if (!post) {

    return (

      <div className="p-6">

        <p className="text-red-500">
          Post not found.
        </p>

      </div>
    );
  }

  return (

    <div
      className="
        max-w-2xl
        mx-auto
        p-4
      "
    >

      <div
        className="
          bg-white
          rounded-2xl
          shadow
          overflow-hidden
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-center
            gap-3
            p-4
          "
        >

          <img
            src={
              post.user
                ?.profilePicture ||
              "https://ui-avatars.com/api/?name=User"
            }
            alt="profile"
            className="
              w-12
              h-12
              rounded-full
              object-cover
            "
          />

          <div>

            <h2 className="font-semibold">
              {post.user?.name}
            </h2>

            <p
              className="
                text-sm
                text-gray-500
              "
            >
              {new Date(
                post.createdAt
              ).toLocaleString()}
            </p>

          </div>

        </div>

        {/* CONTENT */}

        <div className="px-4 pb-4">

          <p
            className="
              whitespace-pre-wrap
              text-[16px]
            "
          >
            {post.content}
          </p>

          {post.edited && (

            <p
              className="
                text-xs
                text-gray-400
                mt-2
              "
            >
              Edited
            </p>

          )}

        </div>

        {/* MEDIA */}

        {post.media &&
          post.media.length > 0 && (

            <div className="space-y-2">

              {post.media.map(
                (
                  item,
                  index
                ) => (

                  <div key={index}>

                    {item.type ===
                    "image" ? (

                      <img
                        src={
                          item.url
                        }
                        alt="post"
                        className="
                          w-full
                          object-cover
                          max-h-[700px]
                        "
                      />

                    ) : (

                      <video
                        controls
                        className="
                          w-full
                          max-h-[700px]
                        "
                      >
                        <source
                          src={
                            item.url
                          }
                        />
                      </video>

                    )}

                  </div>

                )
              )}

            </div>

          )}

        {/* STATS */}

        <div
          className="
            flex
            items-center
            justify-between
            px-4
            py-3
            border-t
            text-sm
            text-gray-500
          "
        >

          <span>
            ❤️{" "}
            {post.likes
              ?.length || 0}{" "}
            Likes
          </span>

          <span>
            💬{" "}
            {post.comments
              ?.length || 0}{" "}
            Comments
          </span>

        </div>

        {/* COMMENTS */}

        <div
          className="
            border-t
            p-4
            space-y-4
          "
        >

          <h3
            className="
              font-semibold
              text-lg
            "
          >
            Comments
          </h3>

          {post.comments
            ?.length === 0 && (

            <p className="text-gray-500">
              No comments yet.
            </p>

          )}

          {post.comments?.map(
            (comment) => (

              <div
                key={
                  comment._id
                }
                className="
                  flex
                  gap-3
                "
              >

                <img
                  src={
                    comment.user
                      ?.profilePicture ||
                    "https://ui-avatars.com/api/?name=User"
                  }
                  alt="profile"
                  className="
                    w-10
                    h-10
                    rounded-full
                    object-cover
                  "
                />

                <div
                  className="
                    bg-gray-100
                    rounded-2xl
                    px-4
                    py-2
                    flex-1
                  "
                >

                  <h4
                    className="
                      font-semibold
                      text-sm
                    "
                  >
                    {
                      comment.user
                        ?.name
                    }
                  </h4>

                  <p
                    className="
                      text-sm
                      whitespace-pre-wrap
                    "
                  >
                    {
                      comment.text
                    }
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
};

export default PostPage;