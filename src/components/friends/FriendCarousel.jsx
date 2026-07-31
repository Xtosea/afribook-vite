import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "../../api/api";
import { useNavigate } from "react-router-dom";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

export default function FriendCarousel() {

const soundRef = useRef(new Audio("/sounds/friend-request.mp3"));

const [users, setUsers] = useState([]);
const navigate = useNavigate();
const [sentRequests, setSentRequests] = useState([]);



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

    // Mark request as sent
    setSentRequests((prev) => [...prev, userId]);

soundRef.current.currentTime = 0;
soundRef.current.play().catch((err) => {
  console.error("Couldn't play sound:", err);
});

    alert("Friend request sent!");
  } catch (err) {
    console.error(err);
    alert("Failed to send request");
  }
};

  return (
    <div className="p-4">

      <h1 className="text-xl font-bold mb-4">
        People You May Know
      </h1>

      <div className="flex flex-col gap-4">

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
  onClick={() => sendFriendRequest(user._id)}
  disabled={sentRequests.includes(user._id)}
  className={`w-full py-2 rounded-xl text-white ${
    sentRequests.includes(user._id)
      ? "bg-gray-400"
      : "bg-blue-600"
  }`}
>
  {sentRequests.includes(user._id)
    ? "Request Sent"
    : "Add Friend"}
</button>

          </div>
        ))}

      </div>
    </div>
  );
}