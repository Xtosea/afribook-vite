import React from "react";

const MutualFriendsSection = ({ mutualFriends = [] }) => {
  if (!mutualFriends.length) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      
      <h3 className="font-semibold mb-3">
        Mutual Friends ({mutualFriends.length})
      </h3>

      <div className="flex -space-x-2 mb-2">
        {mutualFriends.slice(0, 6).map((friend) => (
          <img
            key={friend._id}
            src={friend.profilePic}
            alt={friend.name}
            className="w-8 h-8 rounded-full border-2 border-white object-cover"
          />
        ))}
      </div>

      <p className="text-sm text-gray-600">
        {mutualFriends
          .slice(0, 2)
          .map((f) => f.name)
          .join(", ")}{" "}
        and {mutualFriends.length - 2} others
      </p>

    </div>
  );
};

export default MutualFriendsSection;