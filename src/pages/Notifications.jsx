import React, {
  useEffect,
  useState,
} from "react";

import { API_BASE } from "../api/api";

import { useNavigate } from "react-router-dom";




const defaultProfile =
  "https://ui-avatars.com/api/?name=User";

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


     
      console.log(
  JSON.stringify(notifications, null, 2)
);
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
      <div className="sticky top-0 bg-white z-10 pb-3 mb-4 border-b">
  <h2 className="text-2xl font-bold">
    Notifications
  </h2>

  <p className="text-gray-500 text-sm">
    Stay updated with likes,
    comments, follows and rewards.
  </p>
</div>

      {notifications.length === 0 && <p>No notifications yet</p>}

     {notifications.map((n) => {
  const previewImage =
    n.post?.thumbnail ||
    n.post?.media ||
    n.post?.images?.[0];

  return (
    <div
      key={n._id}
      onClick={() => {
        if (n.post) {
          const postId =
            typeof n.post === "string"
              ? n.post
              : n.post._id;

          navigate(`/post/${postId}`);
        } else if (n.sender) {
          const senderId =
            typeof n.sender === "string"
              ? n.sender
              : n.sender._id;

          navigate(`/profile/${senderId}`);
        }
      }}
      className={`flex gap-3 p-4 rounded-xl mb-3 border cursor-pointer transition hover:bg-gray-50 ${
        !n.read
          ? "bg-blue-50 border-blue-200"
          : "bg-white"
      }`}
    >
      {/* Profile */}
      <img
        src={
          n.sender?.profilePic ||
          defaultProfile
        }
        alt=""
        className="w-14 h-14 rounded-full object-cover border"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm">
              {n.count > 1 ? (
                <>
                  <span className="font-bold">
                    {n.sender?.name || "Someone"}
                  </span>{" "}
                  and{" "}
                  <span className="font-bold">
                    {n.count - 1}
                  </span>{" "}
                  others {n.text}
                </>
              ) : (
                <>
                  <span className="font-bold">
                    {n.sender?.name || "Someone"}
                  </span>{" "}
                  {n.text}
                </>
              )}
            </p>

            {n.senders?.length > 1 && (
              <div className="flex -space-x-2 mb-2">
                {n.senders
                  .slice(0, 3)
                  .map((user) => (
                    <img
                      key={user._id}
                      src={
                        user.profilePic ||
                        defaultProfile
                      }
                      alt=""
                      className="w-7 h-7 rounded-full border-2 border-white object-cover"
                    />
                  ))}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
              {new Date(
                n.createdAt
              ).toLocaleString()}
            </p>
          </div>

          {!n.read && (
            <div className="w-3 h-3 rounded-full bg-blue-500 mt-1" />
          )}
        </div>

        {/* Post Preview */}
        {previewImage && (
          <img
            src={previewImage}
            alt=""
            className="w-24 h-24 rounded-lg object-cover mt-3 border"
          />
        )}
      </div>
    </div>
  );
})}
 </div>
  );
};

export default Notifications;