import React, { useState } from "react";
import { API_BASE } from "../../api/api";

const PhotosSection = ({ posts, user }) => {
  const token = localStorage.getItem("token");

  const images = posts.flatMap((post) =>
    (post.media || [])
      .filter((m) => m.type === "image")
      .map((m) => ({
        ...m,
        postId: post._id,
        likes: post.likes || [],
        comments: post.comments || [],
      }))
  );

  const [selectedImage, setSelectedImage] = useState(null);

  const [likesState, setLikesState] = useState(() => {
    const obj = {};

    images.forEach((img) => {
      obj[img.postId] = img.likes.length || 0;
    });

    return obj;
  });

  const [commentText, setCommentText] = useState("");

  // LIKE
  const handleLike = async (postId) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/posts/${postId}/like`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setLikesState((prev) => ({
        ...prev,
        [postId]: data.likes.length,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // SHARE
  const handleShare = async (imgUrl) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Afribook Photo",
          url: imgUrl,
        });
      } else {
        await navigator.clipboard.writeText(imgUrl);
        alert("Image link copied");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // COMMENT
  const handleComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/posts/${postId}/comment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: commentText,
          }),
        }
      );

      const data = await res.json();

      setSelectedImage((prev) => ({
        ...prev,
        comments: data.comments,
      }));

      setCommentText("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">

      {/* PROFILE + COVER */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">
          Profile Pictures
        </h2>

        <div className="grid grid-cols-2 gap-3">

          {user.profilePic && (
            <img
              src={user.profilePic}
              alt=""
              onClick={() =>
                setSelectedImage({
                  url: user.profilePic,
                  postId: null,
                  comments: [],
                })
              }
              className="rounded-xl object-cover h-48 w-full cursor-pointer hover:scale-105 transition"
            />
          )}

          {user.coverPhoto && (
            <img
              src={user.coverPhoto}
              alt=""
              onClick={() =>
                setSelectedImage({
                  url: user.coverPhoto,
                  postId: null,
                  comments: [],
                })
              }
              className="rounded-xl object-cover h-48 w-full cursor-pointer hover:scale-105 transition"
            />
          )}

        </div>
      </div>

      {/* PHOTOS */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">
          Photos
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[700px] overflow-y-auto pr-2">

          {images.map((img, i) => (
            <div key={i} className="relative">

              <img
                src={img.url}
                alt=""
                onClick={() => setSelectedImage(img)}
                className="rounded-xl object-cover h-52 w-full cursor-pointer hover:scale-105 transition"
              />

              {/* IMAGE ACTIONS */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/60 rounded-lg flex justify-around py-2 text-white text-sm">

                <button
                  onClick={() => handleLike(img.postId)}
                >
                  ❤️ {likesState[img.postId] || 0}
                </button>

                <button
                  onClick={() => setSelectedImage(img)}
                >
                  💬 {img.comments?.length || 0}
                </button>

                <button
                  onClick={() => handleShare(img.url)}
                >
                  🔗 Share
                </button>

              </div>

            </div>
          ))}

        </div>
      </div>

      {/* BIG IMAGE MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">

          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto p-4 relative">

            {/* CLOSE */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 text-white text-3xl"
            >
              ✕
            </button>

            {/* IMAGE */}
            <img
              src={selectedImage.url}
              alt=""
              className="w-full max-h-[70vh] object-contain rounded-xl"
            />

            {/* ACTIONS */}
            {selectedImage.postId && (
              <>
                <div className="flex justify-around mt-4 text-white text-lg">

                  <button
                    onClick={() =>
                      handleLike(selectedImage.postId)
                    }
                  >
                    ❤️ Like
                  </button>

                  <button
                    onClick={() =>
                      handleShare(selectedImage.url)
                    }
                  >
                    🔗 Share
                  </button>

                </div>

                {/* COMMENTS */}
                <div className="mt-6 text-white">

                  <h3 className="font-bold mb-3">
                    Comments
                  </h3>

                  <div className="space-y-2 max-h-60 overflow-y-auto">

                    {selectedImage.comments?.map((c, i) => (
                      <div
                        key={i}
                        className="bg-gray-800 p-2 rounded"
                      >
                        {c.text}
                      </div>
                    ))}

                  </div>

                  {/* COMMENT INPUT */}
                  <div className="flex gap-2 mt-4">

                    <input
                      type="text"
                      placeholder="Write comment..."
                      value={commentText}
                      onChange={(e) =>
                        setCommentText(e.target.value)
                      }
                      className="flex-1 p-2 rounded bg-black border border-gray-700 text-white"
                    />

                    <button
                      onClick={() =>
                        handleComment(selectedImage.postId)
                      }
                      className="bg-blue-600 px-4 rounded"
                    >
                      Send
                    </button>

                  </div>

                </div>
              </>
            )}

          </div>

        </div>
      )}
    </div>
  );
};

export default PhotosSection;