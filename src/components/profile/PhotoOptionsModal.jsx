import React from "react";

export default function PhotoOptionsModal({
  open,
  title,
  onView,
  onTakePhoto,
  onChoosePhoto,
  onRemove,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/50 flex items-end"
      onClick={onCancel}
    >
      <div
        className="w-full bg-white rounded-t-3xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-center mb-5">
          {title}
        </h2>

         <button
          onClick={onView}
          className="w-full text-left py-4 border-b"
        >
          👁️ View
        </button>

         <button
  onClick={onTakePhoto}
  className="w-full text-left py-4 border-b"
>
  📷 Take Photo
</button>

<button
  onClick={onChoosePhoto}
  className="w-full text-left py-4 border-b"
>
  🖼️ Choose from Gallery
</button>

        <button
          onClick={onCancel}
          className="w-full text-left py-4 text-red-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}