import React, { useEffect, useState } from "react";
import { API_BASE, fetchWithToken } from "../api/api";
import UserCard from "../components/onboarding/UserCard";

const AddFriends = () => {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [friendStatuses, setFriendStatuses] = useState({}); // {userId: "pending"}

  // Fetch friends from internal app
  const fetchAppFriends = async () => {
    try {
      const appUsers = await fetchWithToken(`${API_BASE}/api/users/suggestions`, token);
      // mark them as coming from "App"
      return appUsers.map(u => ({ ...u, source: "App" }));
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // Mock fetch from social media (Facebook, Instagram, TikTok)
  const fetchSocialFriends = async () => {
    try {
      // This is placeholder; later integrate APIs
      const facebook = [{ _id: "fb1", name: "John FB", profilePic: "", source: "Facebook" }];
      const instagram = [{ _id: "ig1", name: "Anna IG", profilePic: "", source: "Instagram" }];
      const tiktok = [{ _id: "tt1", name: "Mike TT", profilePic: "", source: "TikTok" }];
      return [...facebook, ...instagram, ...tiktok];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    const init = async () => {
      const appFriends = await fetchAppFriends();
      const socialFriends = await fetchSocialFriends();
      setUsers([...appFriends, ...socialFriends]);
    };
    init();
  }, [token]);

  const handleAddFriend = async (userId) => {
    try {
      // For internal app users, call backend API
      const isAppUser = users.find(u => u._id === userId)?.source === "App";
      if (isAppUser) {
        await fetch(`${API_BASE}/api/friends/request/${userId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // For social media users, you might open their profile or call a link
        alert("Friend request sent to social media user!");
      }
      setFriendStatuses((prev) => ({ ...prev, [userId]: "pending" }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Add Friends</h2>
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