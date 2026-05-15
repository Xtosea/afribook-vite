import React, {
  useState,
} from "react";

import { API_BASE } from "../../api/api";

const StoryReplies = ({
  story,
  onClose,
}) => {
  const [text, setText] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const sendReply = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);

      const token =
        localStorage.getItem(
          "token"
        );

      const res = await fetch(
        `${API_BASE}/api/stories/reply/${story._id}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            text,
          }),
        }
      );

      const data =
        await res.json();

      console.log(data);

      setText("");

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/70
        z-[1000]
        flex
        items-end
      "
    >
      <div
        className="
          bg-white
          w-full
          rounded-t-3xl
          p-4
          max-h-[70vh]
          overflow-y-auto
        "
      >
        {/* HEADER */}
        <div
          className="
            flex
            justify-between
            items-center
            mb-4
          "
        >
          <h2 className="text-lg font-bold">
            Replies
          </h2>

          <button
            onClick={onClose}
            className="text-2xl"
          >
            ✕
          </button>
        </div>

        {/* REPLIES */}
        <div className="space-y-3">
          {story.replies?.map(
            (reply, index) => (
              <div
                key={index}
                className="
                  bg-gray-100
                  p-3
                  rounded-xl
                "
              >
                <p className="font-semibold">
                  {reply.user?.name ||
                    "User"}
                </p>

                <p className="text-sm">
                  {reply.text}
                </p>
              </div>
            )
          )}
        </div>

        {/* INPUT */}
        <div
          className="
            mt-5
            flex
            gap-2
          "
        >
          <input
            type="text"
            value={text}
            onChange={(e) =>
              setText(
                e.target.value
              )
            }
            placeholder="Reply..."
            className="
              flex-1
              border
              rounded-full
              px-4
              py-3
            "
          />

          <button
            onClick={sendReply}
            disabled={loading}
            className="
              bg-blue-500
              text-white
              px-5
              rounded-full
            "
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryReplies;