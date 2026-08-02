import React, { useRef, useState } from "react";
import { API_BASE } from "../../api/api";
import PhotoOptionsModal from "./PhotoOptionsModal";
import PhotoViewerModal from "./PhotoViewerModal";

export default function ProfilePhotoUploader({
  value,
  onChange,
  editable = true,
}) {
  const [showOptions, setShowOptions] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);

  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const image =
    value || `${API_BASE}/uploads/profiles/default-profile.png`;

  const pickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onChange(file);
    setShowOptions(false);
  };

  return (
    <>
      <img
        src={image}
        alt="Profile"
        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer"
        onClick={() => {
          if (editable) setShowOptions(true);
          else setViewerOpen(true);
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
        onTakePhoto={() => cameraRef.current?.click()}
        onChoosePhoto={() => galleryRef.current?.click()}
      />

      <PhotoViewerModal
        open={viewerOpen}
        image={image}
        title="Profile Picture"
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}