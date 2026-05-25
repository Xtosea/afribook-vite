import React, {
  useEffect,
  useState,
} from "react";

const LinkPreview = ({ url }) => {

  const [preview, setPreview] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    let mounted = true;

    const fetchPreview = async () => {

      try {

        const res = await fetch(
          `https://api.microlink.io/?url=${encodeURIComponent(
            url
          )}`
        );

        const data =
          await res.json();

        if (
          mounted &&
          data.status === "success"
        ) {

          setPreview(data.data);

        }

      } catch (err) {

        console.error(
          "Preview error:",
          err
        );

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }
    };

    fetchPreview();

    return () => {
      mounted = false;
    };

  }, [url]);

  // LOADING
  if (loading) {

    return (
      <div className="border rounded-xl p-4 animate-pulse">
        <div className="h-40 bg-gray-200 rounded-lg"></div>
      </div>
    );

  }

  // FAILED
  if (!preview) return null;

  return (

    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
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
          loading="lazy"
          className="
            w-full
            max-h-72
            object-cover
          "
        />

      )}

      {/* CONTENT */}

      <div className="p-4">

        <h3 className="font-semibold line-clamp-2">

          {preview.title ||
            "Link Preview"}

        </h3>

        <p className="text-sm text-gray-600 line-clamp-3 mt-1">

          {preview.description}

        </p>

        <p className="text-xs text-blue-500 truncate mt-2">

          {url}

        </p>

      </div>

    </a>

  );

};

export default React.memo(LinkPreview);