import React, { useState, useEffect } from "react";

import { ImageOff } from "lucide-react";

export default function ListingGallery({
  images = [],
  title = "",
}) {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    setSelected(0);
  }, [images]);

  if (!images.length) {
    return (
      <div className="border rounded-2xl h-80 flex flex-col items-center justify-center text-gray-400">
        <ImageOff size={60} />
        <p className="mt-3">
          No image available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Main Image */}

      <div className="border rounded-2xl overflow-hidden bg-gray-100">

        <img
          src={images[selected]?.url}
          alt={title}
          className="w-full h-96 object-cover"
        />

      </div>

      {/* Thumbnails */}

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">

          {images.map((image, index) => (

            <button
              key={image.public_id || index}
              type="button"
              onClick={() => setSelected(index)}
              className={`border rounded-xl overflow-hidden transition ${
                selected === index
                  ? "border-blue-600 ring-2 ring-blue-500"
                  : "border-gray-200"
              }`}
            >

              <img
                src={image.url}
                alt={`${title} ${index + 1}`}
                className="w-full h-20 object-cover"
              />

            </button>

          ))}

        </div>
      )}

    </div>
  );
}