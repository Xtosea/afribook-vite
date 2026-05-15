import React, { useState } from "react";
import { API_BASE } from "../../api/api";

const StoryReplies = ({ story, onClose }) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const sendReply = async () => {
    if (!text.trim()) return;

    try {
      setSending(true);

      const token = localStorage.getItem("token");

      await fetch(
        `${API_BASE}/api/stories/reply/${story._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      setText("");

    } catch (err) {
      console.error("Reply error:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[999] flex flex-col justify-end">

      {/* HEADER */}
      <div className="p-4 text-white flex justify-between">
        <h2 className="font-bold">Replies</h2>
        <button onClick={onClose}>✕</button>
      </div>

      {/* REPLIES LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {story.replies?.map((r, i) => (
          <div key={i} className="bg-white/10 p-3 rounded-lg text-white">
            <p className="text-sm">{r.text}</p>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="p-3 flex gap-2 bg-black">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Send a reply..."
          className="flex-1 p-2 rounded bg-gray-800 text-white"
        />

        <button
          onClick={sendReply}
          disabled={sending}
          className="bg-blue-500 px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default StoryReplies;