import React, {
  useState,
} from "react";

import { API_BASE } from "../api/api";

const reasons = [
  "Spam",
  "Harassment",
  "Hate Speech",
  "Violence",
  "Fake News",
  "Nudity",
  "Scam",
  "Other",
];

const ReportPostModal = ({
  post,
  token,
  onClose,
}) => {

  const [reason, setReason] =
    useState("Spam");

  const [loading, setLoading] =
    useState(false);

  // =========================
  // SUBMIT REPORT
  // =========================

  const handleReport =
    async () => {

      try {

        setLoading(true);

        const res = await fetch(
          `${API_BASE}/api/posts/${post._id}/report`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              reason,
            }),
          }
        );

        const data =
          await res.json();

        if (!res.ok) {

          throw new Error(
            data.error ||
            "Report failed"
          );
        }

        alert(
          "Post reported successfully"
        );

        onClose?.();

      } catch (err) {

        console.error(err);

        alert(
          err.message ||
          "Report failed"
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
          max-w-md
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
            Report Post
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

        <div className="p-6 space-y-3">

          <p className="text-gray-600">
            Why are you reporting
            this post?
          </p>

          {reasons.map((item) => (

            <button
              key={item}
              onClick={() =>
                setReason(item)
              }
              className={`
                w-full
                text-left
                px-4
                py-3
                rounded-2xl
                border
                transition
                ${
                  reason === item
                    ? "bg-red-500 text-white border-red-500"
                    : "hover:bg-gray-100"
                }
              `}
            >
              {item}
            </button>

          ))}

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
            onClick={handleReport}
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
                  : "bg-red-500 hover:bg-red-600"
              }
            `}
          >
            {loading
              ? "Reporting..."
              : "Report"}
          </button>

        </div>

      </div>

   <button
  onClick={() =>
    setShowReport(true)
  }
  className="
    flex
    items-center
    gap-3
    w-full
    px-4
    py-3
    hover:bg-gray-100
    text-red-500
  "
>
  🚩 Report Post
</button>

    </div>
  );
};

export default ReportPostModal;