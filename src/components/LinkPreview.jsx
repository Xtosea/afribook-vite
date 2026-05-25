import React, {
  useEffect,
  useState,
} from "react";

const LinkPreview = ({ url }) => {

  const [preview, setPreview] =
    useState(null);

  useEffect(() => {

    const fetchPreview = async () => {

      try {

        // FREE API
        const res = await fetch(
          `https://api.microlink.io/?url=${encodeURIComponent(
            url
          )}`
        );

        const data = await res.json();

        if (data.status === "success") {

          setPreview(data.data);

        }

      } catch (err) {

        console.error(
          "Preview error:",
          err
        );

      }

    };

    fetchPreview();

  }, [url]);

  if (!preview) return null;

  return (

    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="
        block
        border
        rounded-xl
        overflow-hidden
        bg-white
        shadow-sm
        hover:shadow-md
        transition
      "
    >

      {/* IMAGE */}

      {preview.image?.url && (

        <img
          src={preview.image.url}
          alt=""
          className="
            w-full
            max-h-64
            object-cover
          "
        />

      )}

      {/* CONTENT */}

      <div className="p-3 space-y-1">

        <p className="font-semibold line-clamp-2">

          {preview.title}

        </p>

        <p className="text-sm text-gray-600 line-clamp-3">

          {preview.description}

        </p>

        <p className="text-xs text-blue-500 truncate">

          {url}

        </p>

      </div>

    </a>

  );

};

export default React.memo(LinkPreview);