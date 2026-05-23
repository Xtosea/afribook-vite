import React, { useEffect, useState } from "react";
import { API_BASE } from "../../api/api";
import { useNavigate } from "react-router-dom";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

export default function DiscoverFriends() {
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
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">

      <h1 className="text-xl font-bold">
        Discover People
      </h1>

      {users.map((user) => (
        <div
          key={user._id}
          className="bg-white rounded-2xl shadow p-4 flex items-center gap-4"
        >

          {/* PROFILE IMAGE */}
          <img
            src={user.profilePic || defaultProfile}
            onError={(e) => (e.target.src = defaultProfile)}
            className="w-16 h-16 rounded-full object-cover"
          />

          {/* INFO */}
          <div className="flex-1">
            <h2 className="font-semibold">
              {user.name}
            </h2>
            <p className="text-sm text-gray-500">
              Suggested for you
            </p>
          </div>

          {/* ACTION */}
          <button
            onClick={() =>
              navigate(`/profile/${user._id}`)
            }
            className="bg-blue-600 text-white px-3 py-2 rounded-xl text-sm"
          >
            View
          </button>
        </div>
      ))}
    </div>
  );
}