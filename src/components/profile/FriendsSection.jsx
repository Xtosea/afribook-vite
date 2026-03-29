// src/components/profile/FriendsSection.jsx
import React from "react";

const FriendsSection = ({ friends = [] }) => {
  if (!friends.length) return <p className="text-center py-4">No friends yet.</p>;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
      {friends.map((friend) => (
        <div key={friend._id} className="flex flex-col items-center">
          <img
            src={friend.profilePic}
            alt={friend.name}
            className="w-20 h-20 rounded-full object-cover mb-2"
          />
          <p className="text-sm text-center">{friend.name}</p>
        </div>
      ))}
    </div>
  );
};

export default FriendsSection;