import React from "react";
import { ImageOff, Trash2 } from "lucide-react";

const ImagePreview = ({
  images = [],
  onRemove,
}) => {
  if (!images.length) {
    return (
      <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-gray-400">
        <ImageOff size={40} />
        <p className="mt-3 text-sm">
          No images selected
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">

      <h3 className="font-semibold text-gray-700">
        Selected Images ({images.length})
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">

        {images.map((image, index) => (
          <div
            key={image.public_id || index}
            className="relative group rounded-xl overflow-hidden border bg-white shadow-sm"
          >
            <img
              src={image.url}
              alt={`Preview ${index + 1}`}
              className="w-full h-40 object-cover"
            />

            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}

      </div>
    </div>
  );
};

export default ImagePreview;