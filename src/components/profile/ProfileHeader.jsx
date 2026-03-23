import React from "react";
import { API_BASE } from "../../api/api";

const ProfileHeader = ({ user, isOwner, onEdit }) => {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      {/* COVER */}
      <div className="relative">
        <img
          src={user.coverPhoto || `${API_BASE}/uploads/profiles/default-cover.png`}
          className="w-full h-48 object-cover"
        />

        {isOwner && (
          <button
            onClick={onEdit}
            className="absolute top-3 right-3 bg-white px-3 py-1 rounded shadow text-sm"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* PROFILE */}
      <div className="p-4 flex items-center gap-4">
        <img
          src={user.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`}
          className="w-24 h-24 rounded-full object-cover border-4 border-white -mt-12"
        />

        <div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-gray-500">{user.bio}</p>
        </div>
      </div>

    </div>
  );
};

export default ProfileHeader;