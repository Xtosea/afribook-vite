import React, { useRef, useState } from "react";
import { API_BASE } from "../../api/api";
import PhotoOptionsModal from "./PhotoOptionsModal";
import PhotoViewerModal from "./PhotoViewerModal";
import ImageCropModal from "./ImageCropModal";

export default function ProfilePhotoUploader({
  value,
  onChange,
  editable = true,
}) {
  const [showOptions, setShowOptions] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [cropImage, setCropImage] = useState(null);

  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const image =
    value || `${API_BASE}/uploads/profiles/default-profile.png`;

  const pickFile = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setShowOptions(false);

    setCropImage(URL.createObjectURL(file));

    e.target.value = "";
  };

  const closeCrop = () => {
    if (cropImage) {
      URL.revokeObjectURL(cropImage);
    }

    setCropImage(null);
  };

  return (
    <>
      <img
        src={image}
        alt="Profile"
        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer"
        onClick={() => {
          if (editable) {
            setShowOptions(true);
          } else {
            setViewerOpen(true);
          }
        }}
      />

      <input
        ref={cameraRef}
        hidden
        type="file"
        accept="image/*"
        capture="user"
        onChange={pickFile}
      />

      <input
        ref={galleryRef}
        hidden
        type="file"
        accept="image/*"
        onChange={pickFile}
      />

      <PhotoOptionsModal
        open={showOptions}
        title="Profile Picture"
        onCancel={() => setShowOptions(false)}
        onView={() => {
          setShowOptions(false);
          setViewerOpen(true);
        }}
        onTakePhoto={() => {
          cameraRef.current?.click();
        }}
        onChoosePhoto={() => {
          galleryRef.current?.click();
        }}
      />

      <PhotoViewerModal
        open={viewerOpen}
        image={image}
        title="Profile Picture"
        onClose={() => setViewerOpen(false)}
      />

      <ImageCropModal
        open={!!cropImage}
        image={cropImage}
        aspect={1}
        cropShape="round"
        onCancel={closeCrop}
        onCropComplete={(croppedFile) => {
          closeCrop();
          onChange?.(croppedFile);
        }}
      />
    </>
  );
}
