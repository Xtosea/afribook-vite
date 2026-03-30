// src/components/profile/ProfileHeader.jsx
import React from "react";
import { API_BASE } from "../../api/api";

const ProfileHeader = ({ user, isOwner, onEdit, previewProfilePic, previewCoverPhoto }) => {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden relative">

      {/* COVER PHOTO */}
      <div className="relative">
        <img
          src={
            previewCoverPhoto instanceof File
              ? URL.createObjectURL(previewCoverPhoto)
              : previewCoverPhoto || `${API_BASE}/uploads/profiles/default-cover.png`
          }
          alt="Cover"
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

      {/* PROFILE PIC & NAME/ BIO */}
      <div className="px-4 pb-4 flex flex-col md:flex-row md:items-center md:gap-6 relative -mt-16">
        
        {/* PROFILE PICTURE */}
        <div className="flex-shrink-0 relative">
          <img
            src={
              previewProfilePic instanceof File
                ? URL.createObjectURL(previewProfilePic)
                : previewProfilePic || `${API_BASE}/uploads/profiles/default-profile.png`
            }
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
          />
        </div>

        {/* NAME & BIO */}
        <div className="mt-4 md:mt-0">
          <h2 className="text-2xl font-bold">{user.name}</h2>
          {user.bio && <p className="text-gray-500 mt-1">{user.bio}</p>}
        </div>
      </div>

    </div>
  );
};

export default ProfileHeader;