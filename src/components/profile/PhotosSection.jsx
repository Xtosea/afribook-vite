import React, { useState } from "react";

const PhotosSection = ({ posts = [], user = {} }) => {
  const safePosts = Array.isArray(posts) ? posts : [];

  const [activeImage, setActiveImage] = useState(null);

  // extract images safely
  const images = safePosts.flatMap((post) =>
    Array.isArray(post.media)
      ? post.media.filter((m) => m?.type === "image").map((m) => ({
          ...m,
          postId: post._id,
        }))
      : []
  );

  /* ================== ACTIONS ================== */
  const handleLike = (img) => {
    console.log("Like image:", img);
    // TODO: call API / socket
  };

  const handleComment = (img) => {
    console.log("Comment image:", img);
    // TODO: open comment modal
  };

  const handleShare = (img) => {
    console.log("Share image:", img);
    // TODO: share logic
  };

  return (
    <div className="space-y-6">

      {/* ================= PROFILE MEDIA ================= */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Profile Media</h2>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {user.profilePic && (
            <img
              src={user.profilePic}
              alt="profile"
              onClick={() =>
                setActiveImage({
                  url: user.profilePic,
                  type: "profile",
                })
              }
              className="w-32 h-32 rounded-xl object-cover cursor-pointer hover:scale-105 transition"
            />
          )}

          {user.coverPhoto && (
            <img
              src={user.coverPhoto}
              alt="cover"
              onClick={() =>
                setActiveImage({
                  url: user.coverPhoto,
                  type: "cover",
                })
              }
              className="w-32 h-32 rounded-xl object-cover cursor-pointer hover:scale-105 transition"
            />
          )}
        </div>
      </div>

      {/* ================= PHOTOS GRID ================= */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Photos</h2>

        {images.length === 0 ? (
          <p className="text-gray-400 text-sm">No photos yet</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative group">

                <img
                  src={img.url}
                  alt=""
                  onClick={() => setActiveImage(img)}
                  className="h-32 w-full object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                />

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">

                  <button
                    onClick={() => handleLike(img)}
                    className="text-white text-lg"
                  >
                    ❤️
                  </button>

                  <button
                    onClick={() => handleComment(img)}
                    className="text-white text-lg"
                  >
                    💬
                  </button>

                  <button
                    onClick={() => handleShare(img)}
                    className="text-white text-lg"
                  >
                    🔗
                  </button>

                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= FULLSCREEN MODAL ================= */}
      {activeImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="relative max-w-3xl w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >

            <img
              src={activeImage.url}
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />

            {/* ACTION BAR */}
            <div className="flex justify-center gap-8 mt-4 text-white text-2xl">

              <button onClick={() => handleLike(activeImage)}>
                ❤️
              </button>

              <button onClick={() => handleComment(activeImage)}>
                💬
              </button>

              <button onClick={() => handleShare(activeImage)}>
                🔗
              </button>

            </div>

            {/* CLOSE */}
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-2 right-2 text-white text-xl"
            >
              ✖
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default PhotosSection;