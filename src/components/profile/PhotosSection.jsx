import React, { useState } from "react";

const PhotosSection = ({ posts, user }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const images = posts
    .flatMap((post) => post.media || [])
    .filter((m) => m.type === "image");

  return (
    <div className="space-y-4">

      {/* ================= PROFILE + COVER ================= */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">
          Profile Pictures
        </h2>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">

          {user.profilePic && (
            <img
              src={user.profilePic}
              alt=""
              onClick={() => setSelectedImage(user.profilePic)}
              className="rounded-xl object-cover h-40 w-40 cursor-pointer hover:scale-105 transition"
            />
          )}

          {user.coverPhoto && (
            <img
              src={user.coverPhoto}
              alt=""
              onClick={() => setSelectedImage(user.coverPhoto)}
              className="rounded-xl object-cover h-40 w-72 cursor-pointer hover:scale-105 transition"
            />
          )}

        </div>
      </div>

      {/* ================= USER PHOTOS ================= */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">
          Photos
        </h2>

        {/* Scrollable Photos */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">

          {images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt=""
              onClick={() => setSelectedImage(img.url)}
              className="rounded-xl object-cover h-48 min-w-[180px] cursor-pointer hover:scale-105 transition"
            />
          ))}

        </div>
      </div>

      {/* ================= FULLSCREEN IMAGE VIEWER ================= */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >

          {/* Close Button */}
          <button
            className="absolute top-5 right-5 text-white text-4xl"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>

          {/* Large Image */}
          <img
            src={selectedImage}
            alt=""
            className="max-h-[95vh] max-w-[95vw] rounded-xl object-contain"
          />

        </div>
      )}

    </div>
  );
};

export default PhotosSection;