// src/pages/onboarding/AddFriends.jsx
import React, { useEffect, useState } from "react";
import { API_BASE, fetchWithToken } from "../../api/api";
import UserCard from "../../components/onboarding/UserCard";

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
  const [friendStatuses, setFriendStatuses] = useState({}); // {userId: "pending" | "added"}

  // Fetch internal app friend suggestions
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

  // Handle internal app friend request
  const handleAddFriend = async (userId) => {
    try {
      await fetch(`${API_BASE}/api/friends/request/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriendStatuses((prev) => ({ ...prev, [userId]: "pending" }));
    } catch (err) {
      console.error(err);
      alert("Failed to send friend request");
    }
  };

  // Mock social connect
  const handleConnectSocial = (provider) => {
    alert(`Connected to ${provider} successfully!`);
    // For now, we just merge mock friends
    const socialFriends = MOCK_SOCIAL_FRIENDS.filter(f => f.source === provider);
    setUsers((prev) => [...prev, ...socialFriends]);
  };

  return (
    <div className="max-w-md mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Add Friends</h2>

      {/* Social Connect Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleConnectSocial("Facebook")}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Connect Facebook
        </button>
        <button
          onClick={() => handleConnectSocial("Instagram")}
          className="bg-pink-500 text-white px-3 py-1 rounded"
        >
          Connect Instagram
        </button>
        <button
          onClick={() => handleConnectSocial("TikTok")}
          className="bg-black text-white px-3 py-1 rounded"
        >
          Connect TikTok
        </button>
      </div>

      {/* Internal app friends + social friends list */}
      {users.length === 0 && <p>No suggestions yet.</p>}
      <div className="space-y-3">
        {users.map((user) => (
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