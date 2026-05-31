import React, {
  useEffect,
  useState,
} from "react";

import { API_BASE } from "../api/api";

import { useNavigate } from "react-router-dom";




const defaultProfile =
  "https://via.placeholder.com/100";

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setNotifications(data);

      await fetch(`${API_BASE}/api/notifications/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading notifications...</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>

      {notifications.length === 0 && <p>No notifications yet</p>}

      {notifications.map((n) => (
        <div
          key={n._id}
          onClick={() => {
            if (n.post) {
              const postId = typeof n.post === "string" ? n.post : n.post._id;
              navigate(`/post/${postId}`);
            } else if (n.sender) {
              const senderId = typeof n.sender === "string" ? n.sender : n.sender._id;
              navigate(`/profile/${senderId}`);
            }
          }}
          className={`flex gap-3 p-3 rounded-lg mb-2 border cursor-pointer ${
            !n.read ? "bg-blue-50" : "bg-white"
          }`}
        >
          <img
            src={n.sender?.profilePic || defaultProfile}
            className="w-12 h-12 rounded-full object-cover"
          />

          <div className="flex-1">
            <p className="text-sm">
              <p className="text-sm">
  {n.count > 1 ? (
    <>
      <span className="font-semibold">
        {n.sender?.name || "Someone"}
      </span>{" "}
      and {n.count - 1} others {n.text}
    </>
  ) : (
    <>
      <span className="font-semibold">
        {n.sender?.name || "Someone"}
      </span>{" "}
      {n.text}
    </>
  )}
</p>
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;