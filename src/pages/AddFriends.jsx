import React, { useEffect, useState } from "react";
import { API_BASE, fetchWithToken } from "../api/api";
import UserCard from "../components/onboarding/UserCard";

const AddFriends = () => {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [friendStatuses, setFriendStatuses] = useState({}); // {userId: "pending"}
  const [loadingSocial, setLoadingSocial] = useState(false);

  // Fetch friends from internal app
  const fetchAppFriends = async () => {
    try {
      const appUsers = await fetchWithToken(`${API_BASE}/api/users/suggestions`, token);
      return appUsers.map(u => ({ ...u, source: "App" }));
    } catch (err) {
      console.error("Error fetching app friends:", err);
      return [];
    }
  };

  // Fetch social friends (mock for now)
  const fetchSocialFriends = async (platform) => {
    setLoadingSocial(true);
    try {
      let friends = [];
      if (platform === "facebook") {
        friends = [{ _id: "fb1", name: "John FB", profilePic: "", source: "Facebook" }];
      } else if (platform === "instagram") {
        friends = [{ _id: "ig1", name: "Anna IG", profilePic: "", source: "Instagram" }];
      } else if (platform === "tiktok") {
        friends = [{ _id: "tt1", name: "Mike TT", profilePic: "", source: "TikTok" }];
      }

      // Only add new friends not already in the list
      setUsers((prev) => {
        const existingIds = new Set(prev.map(u => u._id));
        const newFriends = friends.filter(f => !existingIds.has(f._id));
        return [...prev, ...newFriends];
      });
    } catch (err) {
      console.error("Error fetching social friends:", err);
    } finally {
      setLoadingSocial(false);
    }
  };

  useEffect(() => {
    // Load app friends initially
    const init = async () => {
      const appFriends = await fetchAppFriends();
      setUsers(appFriends);
    };
    init();
  }, [token]);

  const handleAddFriend = async (userId) => {
    try {
      const user = users.find(u => u._id === userId);
      if (!user) return;

      if (user.source === "App") {
        // Send friend request to internal app user
        await fetch(`${API_BASE}/api/friends/request/${userId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // For social media users, simulate sending request
        alert(`Friend request sent to ${user.name} on ${user.source}!`);
      }

      setFriendStatuses((prev) => ({ ...prev, [userId]: "pending" }));
    } catch (err) {
      console.error("Error sending friend request:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Add Friends</h2>

      {/* Social Connect Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => fetchSocialFriends("facebook")}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Connect Facebook
        </button>
        <button
          onClick={() => fetchSocialFriends("instagram")}
          className="bg-pink-500 text-white px-3 py-1 rounded"
        >
          Connect Instagram
        </button>
        <button
          onClick={() => fetchSocialFriends("tiktok")}
          className="bg-black text-white px-3 py-1 rounded"
        >
          Connect TikTok
        </button>
      </div>

      {loadingSocial && <p>Loading social friends...</p>}
      {users.length === 0 && <p>No suggestions yet.</p>}

      {users.map((user) => (
        <UserCard
          key={user._id}
          user={user}
          status={friendStatuses[user._id]}
          onAddFriend={handleAddFriend}
        />
      ))}
    </div>
  );
};

export default AddFriends;