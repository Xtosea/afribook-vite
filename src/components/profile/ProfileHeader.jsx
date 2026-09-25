// src/components/profile/ProfileHeader.jsx

import React, {
  useRef,
  useState,
} from "react";

import ProfilePhotoUploader from "./ProfilePhotoUploader";
import PhotoOptionsModal from "./PhotoOptionsModal";
import ImageCropModal from "./ImageCropModal";

const ProfileHeader = ({
  user,
  isOwner,
  onEdit,
  previewProfilePic,
  previewCoverPhoto,
  onUploadProfilePhoto,
  onViewCoverPhoto,
  onUploadCoverPhoto,
}) => {
  const [copied, setCopied] = useState(false);

  const [showCoverOptions, setShowCoverOptions] =
    useState(false);

  const [coverCropImage, setCoverCropImage] =
    useState(null);

  const coverCameraRef = useRef(null);
  const coverGalleryRef = useRef(null);

  const referralLink =
    `${window.location.origin}/register?ref=${user.referralCode}`;

  const copyReferral = async () => {
    await navigator.clipboard.writeText(
      referralLink
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const shareReferral = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Join me on AfricSocial",
        text:
          "Join AfricSocial with my referral link.",
        url: referralLink,
      });
    } else {
      copyReferral();
    }
  };

  // ================= COVER PHOTO FILE PICKER =================

  const pickCoverFile = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setShowCoverOptions(false);

    const objectUrl =
      URL.createObjectURL(file);

    setCoverCropImage(objectUrl);

    // Allows selecting the same image again later.
    e.target.value = "";
  };

  const closeCoverCrop = () => {
    if (coverCropImage) {
      URL.revokeObjectURL(coverCropImage);
    }

    setCoverCropImage(null);
  };

  const handleCoverCropComplete = (croppedFile) => {
    closeCoverCrop();

    if (croppedFile) {
      onUploadCoverPhoto?.(croppedFile);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden relative">

      {/* =====================================================
          COVER PHOTO
          ===================================================== */}

      <div className="relative">

        <img
          src={
            previewCoverPhoto instanceof File
              ? URL.createObjectURL(
                  previewCoverPhoto
                )
              : previewCoverPhoto ||
                "/default-cover.svg"
          }
          alt="Cover"
          onClick={() => {
            if (isOwner) {
              setShowCoverOptions(true);
            } else {
              onViewCoverPhoto?.();
            }
          }}
          className="w-full h-48 object-cover cursor-pointer"
        />

        {/* Hidden camera input */}
        <input
          ref={coverCameraRef}
          hidden
          type="file"
          accept="image/*"
          capture="environment"
          onChange={pickCoverFile}
        />

        {/* Hidden gallery input */}
        <input
          ref={coverGalleryRef}
          hidden
          type="file"
          accept="image/*"
          onChange={pickCoverFile}
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

      {/* =====================================================
          PROFILE PIC & NAME / BIO
          ===================================================== */}

      <div className="px-4 pb-4 flex flex-col md:flex-row md:items-center md:gap-6 relative -mt-16">

        {/* PROFILE PICTURE */}

        <ProfilePhotoUploader
          value={previewProfilePic}
          editable={isOwner}
          onChange={(file) => {
            onUploadProfilePhoto?.(file);
          }}
        />

        {/* NAME & BIO */}

        <div className="mt-4 md:mt-0">

          <h2 className="text-2xl font-bold">
            {user.name}
          </h2>

          {user.bio && (
            <p className="text-gray-500 mt-1">
              {user.bio}
            </p>
          )}

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

      {/* =====================================================
          COVER PHOTO OPTIONS
          ===================================================== */}

      <PhotoOptionsModal
        open={showCoverOptions}
        title="Cover Photo"
        onCancel={() =>
          setShowCoverOptions(false)
        }

        onView={() => {
          setShowCoverOptions(false);
          onViewCoverPhoto?.();
        }}

        onTakePhoto={() => {
          coverCameraRef.current?.click();
        }}

        onChoosePhoto={() => {
          coverGalleryRef.current?.click();
        }}
      />

      {/* =====================================================
          COVER PHOTO CROP
          ===================================================== */}

      <ImageCropModal
        open={!!coverCropImage}
        image={coverCropImage}
        aspect={16 / 9}
        cropShape="rect"
        onCancel={closeCoverCrop}
        onCropComplete={
          handleCoverCropComplete
        }
      />

    </div>
  );
};

export default ProfileHeader;
