// src/components/profile/ProfileHeader.jsx

import React, {
  useState,
} from "react";
import { API_BASE } from "../../api/api";
import PhotoOptionsModal from "./PhotoOptionsModal";


const ProfileHeader = ({
  user,
  isOwner,
  onEdit,
  previewProfilePic,
  previewCoverPhoto,
  onViewProfilePhoto,
  onViewCoverPhoto,
}) => {

const isDefaultProfilePic =
  !previewProfilePic &&
  !user.profilePic;

 const [copied, setCopied] =
  useState(false);
const [showProfileOptions, setShowProfileOptions] =
  useState(false);

const [showCoverOptions, setShowCoverOptions] =
  useState(false);

const referralLink =
  `${window.location.origin}/register?ref=${user.referralCode}`;

const copyReferral =
  async () => {
    await navigator.clipboard.writeText(
      referralLink
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

const shareReferral =
  async () => {
    if (navigator.share) {
      await navigator.share({
        title:
          "Join me on AfricSocial",

        text:
          "Join AfricSocial with my referral link.",

        url: referralLink,
      });
    } else {
      copyReferral();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden relative">

      {/* COVER PHOTO */}
      <div className="relative">
        <img
  src={
    previewCoverPhoto instanceof File
      ? URL.createObjectURL(previewCoverPhoto)
      : previewCoverPhoto ||
        `${API_BASE}/uploads/profiles/default-cover.png`
  }
  alt="Cover"
  onClick={() => setShowCoverOptions(true)}
  className="w-full h-48 object-cover cursor-pointer"
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
      : previewProfilePic ||
        `${API_BASE}/uploads/profiles/default-profile.png`
  }
  alt="Profile"
  onClick={() => setShowProfileOptions(true)}
  className={`rounded-full object-cover border-4 border-white shadow-lg cursor-pointer ${
    isDefaultProfilePic
      ? "w-20 h-20"
      : "w-32 h-32"
  }`}
/>
</div>

        {/* NAME & BIO */}
        <div className="mt-4 md:mt-0">
          <h2 className="text-2xl font-bold">{user.name}</h2>
          {user.bio && <p className="text-gray-500 mt-1">{user.bio}</p>
}

{isOwner && (
  <div className="mt-4 border rounded-lg p-3 bg-gray-50">

    <p className="font-semibold mb-2">
      🎁 Referral Link
    </p>

    <input
      readOnly
      value={referralLink}
      className="w-full border rounded p-2 text-sm"
    />

    <div className="flex gap-2 mt-2">

      <button
        onClick={copyReferral}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {copied
          ? "Copied!"
          : "Copy"}
      </button>

      <button
        onClick={shareReferral}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Share
      </button>

    </div>

  </div>
)}
       
  </div>
  </div>
  

  <PhotoOptionsModal
  open={showProfileOptions}
  title="Profile Picture"
  onCancel={() => setShowProfileOptions(false)}
  onView={() => {
    setShowProfileOptions(false);
    onViewProfilePhoto?.();
  }}
  onTakePhoto={() => {
    setShowProfileOptions(false);
    onUploadProfilePhoto?.("camera");
  }}
  onChoosePhoto={() => {
    setShowProfileOptions(false);
    onUploadProfilePhoto?.("gallery");
  }}
/>

 <PhotoOptionsModal
  open={showCoverOptions}
  title="Cover Photo"
  onCancel={() => setShowCoverOptions(false)}
  onView={() => {
    setShowCoverOptions(false);
    onViewCoverPhoto?.();
  }}
  onTakePhoto={() => {
    setShowCoverOptions(false);
    onUploadCoverPhoto?.("camera");
  }}
  onChoosePhoto={() => {
    setShowCoverOptions(false);
    onUploadCoverPhoto?.("gallery");
  }}
/>

</div>
  );
};

export default ProfileHeader;