import React, { useState } from "react";

const PhotosSection = ({ posts, user }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Extract only image media
  const images = posts.flatMap((post) =>
    (post.media || [])
      .filter((m) => m.type === "image")
      .map((m) => ({
        ...m,
        postId: post._id,
        likes: post.likes?.length || 0,
        comments: post.comments?.length || 0,
        shares: post.shares || 0,
      }))
  );

  return (
    <div className="space-y-4">

      {/* ================= PROFILE PHOTOS ================= */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">
          Profile Pictures
        </h2>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">

          {user.profilePic && (
            <div className="min-w-[160px]">
              <img
                src={user.profilePic}
                alt=""
                onClick={() => setSelectedImage(user.profilePic)}
                className="h-44 w-full object-cover rounded-xl cursor-pointer"
              />

              <div className="flex justify-around text-sm mt-2 text-gray-600">
                <button>❤️ 0</button>
                <button>💬 0</button>
                <button>🔗 0</button>
              </div>
            </div>
          )}

          {user.coverPhoto && (
            <div className="min-w-[250px]">
              <img
                src={user.coverPhoto}
                alt=""
                onClick={() => setSelectedImage(user.coverPhoto)}
                className="h-44 w-full object-cover rounded-xl cursor-pointer"
              />

              <div className="flex justify-around text-sm mt-2 text-gray-600">
                <button>❤️ 0</button>
                <button>💬 0</button>
                <button>🔗 0</button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================= USER PHOTOS ================= */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">
          Photos
        </h2>

        {/* Scrollable Row */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">

          {images.map((img, i) => (
            <div
              key={i}
              className="min-w-[220px] bg-gray-50 rounded-2xl overflow-hidden shadow"
            >

              {/* Image */}
              <img
                src={img.url}
                alt=""
                onClick={() => setSelectedImage(img.url)}
                className="h-64 w-full object-cover cursor-pointer"
              />

              {/* Actions */}
              <div className="p-3 flex justify-between text-sm text-gray-700">

                <button className="hover:text-red-500 transition">
                  ❤️ {img.likes}
                </button>

                <button className="hover:text-blue-500 transition">
                  💬 {img.comments}
                </button>

                <button className="hover:text-green-500 transition">
                  🔗 {img.shares}
                </button>

              </div>

            </div>
          ))}

        </div>
      </div>

      {/* ================= FULLSCREEN VIEW ================= */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >

          {/* Close */}
          <button
            className="absolute top-5 right-5 text-white text-4xl"
          >
            ×
          </button>

          {/* Image */}
          <img
            src={selectedImage}
            alt=""
            className="max-h-[95vh] max-w-[95vw] object-contain rounded-xl"
          />

        </div>
      )}

    </div>
  );
};

export default PhotosSection;