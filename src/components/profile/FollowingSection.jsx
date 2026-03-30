import React from "react";

const FollowingSection = ({ following = [] }) => {
  if (!following.length)
    return (
      <p className="text-center py-4">
        Not following anyone yet
      </p>
    );

  return (
    <div className="space-y-3">
      {following.map((user) => (
        <div
          key={user._id}
          className="flex items-center gap-3 p-3 bg-white rounded shadow"
        >
          <img
            src={user.profilePic}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover"
          />

          <div>
            <p className="font-semibold">
              {user.name}
            </p>

            <p className="text-sm text-gray-500">
              {user.bio || "Afribook user"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FollowingSection;