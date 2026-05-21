import React, {
  useState,
} from "react";

import { API_BASE } from "../api/api";

const EditPostModal = ({
  post,
  token,
  onClose,
  onUpdated,
}) => {

  const [content, setContent] =
    useState(post?.content || "");

  const [loading, setLoading] =
    useState(false);

  // =========================
  // UPDATE POST
  // =========================

  const handleUpdate =
    async () => {

      if (!content.trim()) {
        return;
      }

      try {

        setLoading(true);

        const res = await fetch(
          `${API_BASE}/api/posts/${post._id}`,
          {
            method: "PUT",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              content,
            }),
          }
        );

        const data =
          await res.json();

        if (!res.ok) {

          throw new Error(
            data.error ||
            "Update failed"
          );
        }

        onUpdated?.(data.post);

        onClose?.();

      } catch (err) {

        console.error(err);

        alert(
          err.message ||
          "Update failed"
        );

      } finally {

        setLoading(false);

      }
    };

  return (

    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        p-4
      "
    >

      <div
        className="
          bg-white
          w-full
          max-w-lg
          rounded-3xl
          shadow-2xl
          overflow-hidden
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            px-6
            py-4
            border-b
          "
        >

          <h2
            className="
              text-xl
              font-bold
            "
          >
            Edit Post
          </h2>

         <button
  onClick={onClose}
  className="
    text-gray-500
    hover:text-black
    text-2xl
  "
>
  ×
</button>

        </div>

        {/* BODY */}

        <div className="p-6">

          <textarea
            value={content}
            onChange={(e) =>
              setContent(
                e.target.value
              )
            }
            rows={6}
            placeholder="Edit your post..."
            className="
              w-full
              border
              rounded-2xl
              p-4
              resize-none
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />

        </div>

        {/* FOOTER */}

        <div
          className="
            flex
            justify-end
            gap-3
            px-6
            py-4
            border-t
          "
        >

          <button
            onClick={onClose}
            className="
              px-5
              py-2
              rounded-full
              bg-gray-200
              hover:bg-gray-300
              transition
            "
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className={`
              px-5
              py-2
              rounded-full
              text-white
              transition
              ${
                loading
                  ? "bg-gray-400"
                  : "bg-blue-500 hover:bg-blue-600"
              }
            `}
          >
            {loading
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default EditPostModal;