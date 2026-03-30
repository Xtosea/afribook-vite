// src/components/profile/MutualFriendsSection.jsx
import React from "react";
import { API_BASE } from "../../api/api";

const MutualFriendsSection = ({ mutualFriends = [] }) => {
  if (!mutualFriends.length) return null;

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">Mutual Friends</h3>
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {mutualFriends.map((user) => (
          <div key={user._id} className="flex flex-col items-center min-w-[70px]">
            <img
              src={
                user.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`
              }
              alt={user.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
            />
            <p className="text-xs mt-1 text-center truncate">{user.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MutualFriendsSection;