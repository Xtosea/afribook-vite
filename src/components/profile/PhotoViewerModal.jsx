import React from "react";
import { X } from "lucide-react";

export default function PhotoViewerModal({
  open,
  image,
  title,
  onClose,
}) {
  if (!open || !image) return null;

  return (
    <div className="fixed inset-0 z-[11000] bg-black flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <h2 className="font-semibold">
          {title}
        </h2>

        <button onClick={onClose}>
          <X size={28} />
        </button>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center overflow-auto">

        <img
          src={image}
          alt={title}
          className="
            max-w-full
            max-h-full
            object-contain
            select-none
          "
        />

      </div>

    </div>
  );
}