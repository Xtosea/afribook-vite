import React, { useEffect, useState } from "react";
import { API_BASE } from "../../api/api";
import { useNavigate } from "react-router-dom";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

export default function FriendCarousel() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

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

  return (
    <div className="p-4">

      <h1 className="text-xl font-bold mb-4">
        People You May Know
      </h1>

      <div className="flex gap-4 overflow-x-auto pb-4">

        {users.map((user) => (
          <div
            key={user._id}
            className="min-w-[260px] bg-white shadow rounded-2xl p-4 flex-shrink-0"
          >

            <img
              src={user.profilePic || defaultProfile}
              onError={(e) => (e.target.src = defaultProfile)}
              className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
            />

            <h2 className="text-center font-semibold">
              {user.name}
            </h2>

            <p className="text-center text-sm text-gray-500 mb-3">
              Suggested Friend
            </p>

            <button
              onClick={() =>
                navigate(`/profile/${user._id}`)
              }
              className="w-full bg-blue-600 text-white py-2 rounded-xl"
            >
              View Profile
            </button>

          </div>
        ))}

      </div>
    </div>
  );
}