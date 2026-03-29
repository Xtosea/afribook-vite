import React from "react";

const PhotosSection = ({ posts, user }) => {

  const images = posts
    .flatMap((post) => post.media || [])
    .filter((m) => m.type === "image");

  return (
    <div className="space-y-4">

      {/* Profile + Cover */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">
          Profile Pictures
        </h2>

        <div className="grid grid-cols-3 gap-2">

          {user.profilePic && (
            <img
              src={user.profilePic}
              alt=""
              className="rounded-lg object-cover h-32 w-full"
            />
          )}

          {user.coverPhoto && (
            <img
              src={user.coverPhoto}
              alt=""
              className="rounded-lg object-cover h-32 w-full"
            />
          )}

        </div>
      </div>


      {/* User Uploaded Photos */}

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">
          Photos
        </h2>

        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt=""
              className="rounded-lg object-cover h-32 w-full"
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default PhotosSection;