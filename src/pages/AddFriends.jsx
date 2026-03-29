// src/pages/onboarding/AddFriends.jsx
import React, { useEffect, useState } from "react";
import { API_BASE, fetchWithToken } from "../api/api";
import UserCard from "../components/onboarding/UserCard";
import FacebookLogin from "../components/onboarding/FacebookLogin";

const MOCK_SOCIAL_FRIENDS = [
  {
    _id: "fb1",
    name: "Alice FB",
    profilePic: "https://i.pravatar.cc/150?img=5",
    source: "Facebook",
  },
  {
    _id: "ig1",
    name: "Bob IG",
    profilePic: "https://i.pravatar.cc/150?img=6",
    source: "Instagram",
  },
  {
    _id: "tt1",
    name: "Charlie TT",
    profilePic: "https://i.pravatar.cc/150?img=7",
    source: "TikTok",
  },
];

const AddFriends = () => {
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [socialUsers, setSocialUsers] = useState([]);
  const [friendStatuses, setFriendStatuses] = useState({});
  const [search, setSearch] = useState("");

  /* ================= FETCH SUGGESTED USERS ================= */

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await fetchWithToken(
          `${API_BASE}/api/users/suggestions`,
          token
        );

        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, [token]);

  /* ================= ADD FRIEND ================= */

  const handleAddFriend = async (userId) => {
    try {
      await fetch(`${API_BASE}/api/friends/request/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFriendStatuses((prev) => ({
        ...prev,
        [userId]: "pending",
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to send friend request");
    }
  };

  /* ================= CONNECT SOCIAL ================= */

  const handleConnectSocial = (provider) => {
    alert(`Connected to ${provider} successfully`);

    const socialFriends = MOCK_SOCIAL_FRIENDS.filter(
      (f) => f.source === provider
    );

    setSocialUsers((prev) => [...prev, ...socialFriends]);
  };

  /* ================= SEARCH FILTER ================= */

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-md mx-auto mt-6 space-y-4">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold">Add Friends</h2>
        <p className="text-gray-500 text-sm">
          Find people you may know
        </p>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search people..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
      />

      {/* SOCIAL CONNECT */}
      <div className="space-y-2">

        <h3 className="font-semibold text-gray-700">
          Connect Social Accounts
        </h3>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleConnectSocial("Facebook")}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Facebook
          </button>

          <button
            onClick={() => handleConnectSocial("Instagram")}
            className="bg-pink-500 text-white px-3 py-1 rounded"
          >
            Instagram
          </button>

          <button
            onClick={() => handleConnectSocial("TikTok")}
            className="bg-black text-white px-3 py-1 rounded"
          >
            TikTok
          </button>
        </div>
      </div>

      <FacebookLogin />

      {/* SOCIAL FRIENDS */}
      {socialUsers.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">
            From Social Accounts
          </h3>

          {socialUsers.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              status={friendStatuses[user._id]}
              onAddFriend={() => handleAddFriend(user._id)}
            />
          ))}
        </div>
      )}

      {/* SUGGESTED FRIENDS */}
      <div className="space-y-3">

        <h3 className="font-semibold text-gray-700">
          Suggested For You
        </h3>

        {filteredUsers.length === 0 && (
          <p className="text-gray-500">
            No suggestions yet
          </p>
        )}

        {filteredUsers.map((user) => (
          <UserCard
            key={user._id}
            user={user}
            status={friendStatuses[user._id]}
            onAddFriend={() => handleAddFriend(user._id)}
          />
        ))}
      </div>

    </div>
  );
};

export default AddFriends;