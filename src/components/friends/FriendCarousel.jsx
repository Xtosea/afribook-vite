import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "../../api/api";
import { useNavigate } from "react-router-dom";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

const TARGET_FRIENDS = 20;

export default function FriendCarousel() {
  const soundRef = useRef(
    new Audio("/sounds/friend-request.mp3")
  );

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friendCount, setFriendCount] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_BASE}/api/friends/suggestions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (friendCount >= TARGET_FRIENDS) {
      navigate("/", { replace: true });
    }
  }, [friendCount, navigate]);

  const sendFriendRequest = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/friends/request/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return alert(data.error);
      }

      setSentRequests((prev) => [...prev, userId]);

      setFriendCount((prev) => prev + 1);

      soundRef.current.currentTime = 0;

      soundRef.current.play().catch((err) => {
        console.error("Couldn't play sound:", err);
      });

    } catch (err) {
      console.error(err);
      alert("Failed to send request");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">

      <h1 className="text-2xl font-bold text-center mb-2">
        Find Friends
      </h1>

      <p className="text-center text-gray-600 mb-4">
        Add at least <strong>{TARGET_FRIENDS}</strong> friends to
        personalize your AfricSocial experience.
      </p>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Progress</span>
          <span>
            {friendCount}/{TARGET_FRIENDS}
          </span>
        </div>

        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${(friendCount / TARGET_FRIENDS) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">

        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white shadow rounded-2xl p-4"
          >
            <img
              src={user.profilePic || defaultProfile}
              onError={(e) =>
                (e.target.src = defaultProfile)
              }
              alt={user.name}
              className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
            />

            <h2 className="text-center font-semibold">
              {user.name}
            </h2>

            <p className="text-center text-sm text-gray-500 mb-3">
              Suggested Friend
            </p>

            <button
              onClick={() => sendFriendRequest(user._id)}
              disabled={sentRequests.includes(user._id)}
              className={`w-full py-2 rounded-xl text-white ${
                sentRequests.includes(user._id)
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {sentRequests.includes(user._id)
                ? "Request Sent"
                : "Add Friend"}
            </button>
          </div>
        ))}

      </div>

      <button
        onClick={() => navigate("/", { replace: true })}
        className="w-full mt-8 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100"
      >
        Skip for now
      </button>

    </div>
  );
}