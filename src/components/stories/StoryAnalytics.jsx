import React, {
  useEffect,
  useState,
} from "react";
import { API_BASE } from "../../api/api";

const StoryAnalytics = ({ story, onClose }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_BASE}/api/stories/analytics/${story._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Analytics error:", err);
      }
    };

    fetchAnalytics();
  }, [story]);

  if (!data) {
    return (
      <div className="p-4 text-white">Loading...</div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-[999] text-white p-4 overflow-y-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Story Analytics
        </h2>

        <button onClick={onClose}>✕</button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 gap-3 mb-6">

        <div className="bg-white/10 p-3 rounded">
          👁 Views: {data.views}
        </div>

        <div className="bg-white/10 p-3 rounded">
          💬 Replies: {data.replies}
        </div>

        <div className="bg-white/10 p-3 rounded">
          🔁 Shares: {data.shares}
        </div>

        <div className="bg-white/10 p-3 rounded">
          💰 Points: {data.engagementPoints}
        </div>

      </div>

      {/* REACTIONS */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">
          Reactions
        </h3>

        {Object.entries(data.reactions).map(
          ([key, value]) => (
            <div
              key={key}
              className="flex justify-between bg-white/5 p-2 rounded mb-1"
            >
              <span>{key}</span>
              <span>{value}</span>
            </div>
          )
        )}
      </div>

      {/* VIEWERS */}
      <div>
        <h3 className="font-bold mb-2">
          Viewers
        </h3>

        {data.viewers?.map((v) => (
          <div
            key={v._id}
            className="flex items-center gap-2 mb-2"
          >
            <img
              src={v.profilePic}
              className="w-8 h-8 rounded-full"
            />
            <span>{v.name}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default StoryAnalytics;