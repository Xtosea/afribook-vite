import React, {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { API_BASE } from "../api/api";

const SavedPosts = ({
  token,
}) => {

  const [posts, setPosts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // =========================
  // FETCH SAVED POSTS
  // =========================

  useEffect(() => {

    const fetchSavedPosts =
      async () => {

        try {

          const res = await fetch(
            `${API_BASE}/api/posts/saved/all`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

          const data =
            await res.json();

          if (!res.ok) {

            throw new Error(
              data.error ||
              "Failed to load saved posts"
            );
          }

          setPosts(data);

        } catch (err) {

          console.error(err);

        } finally {

          setLoading(false);

        }
      };

    if (token) {
      fetchSavedPosts();
    }

  }, [token]);

  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (

      <div className="p-6">

        <p className="text-gray-500">
          Loading saved posts...
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
        space-y-4
      "
    >

      {/* HEADER */}

      <div
        className="
          bg-white
          rounded-2xl
          shadow
          p-5
        "
      >

        <h1
          className="
            text-2xl
            font-bold
          "
        >
          🔖 Saved Posts
        </h1>

        <p className="text-gray-500 mt-1">
          Posts you saved will
          appear here.
        </p>

      </div>

      {/* EMPTY */}

      {posts.length === 0 && (

        <div
          className="
            bg-white
            rounded-2xl
            shadow
            p-8
            text-center
          "
        >

          <p className="text-gray-500">
            No saved posts yet.
          </p>

        </div>

      )}

      {/* POSTS */}

      {posts.map((post) => (

        <div
          key={post._id}
          className="
            bg-white
            rounded-2xl
            shadow
            overflow-hidden
          "
        >

          {/* USER */}

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
                {
                  post.user
                    ?.name
                }
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
              "
            >
              {post.content}
            </p>

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

                    <div
                      key={index}
                    >

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
                            max-h-[500px]
                          "
                        />

                      ) : (

                        <video
                          controls
                          className="
                            w-full
                            max-h-[500px]
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

          {/* ACTIONS */}

          <div
            className="
              flex
              justify-between
              items-center
              p-4
              border-t
            "
          >

            <Link
              to={`/post/${post._id}`}
              className="
                text-blue-500
                font-medium
              "
            >
              👁 View Post
            </Link>

          </div>

        </div>

      ))}

    </div>
  );
};

export default SavedPosts;