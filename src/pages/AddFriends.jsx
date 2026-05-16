// src/pages/onboarding/AddFriends.jsx

import React, { useEffect, useState } from "react";
import { API_BASE, fetchWithToken } from "../api/api";
import UserCard from "../components/onboarding/UserCard";

const AddFriends = () => {

  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [friendStatuses, setFriendStatuses] = useState({});
  const [search, setSearch] = useState("");

  /* ================= FETCH USERS ================= */

  useEffect(() => {

    const fetchUsers = async () => {

      try {

        const data = await fetchWithToken(
          `${API_BASE}/api/users/suggestions`,
          token
        );

        setUsers(Array.isArray(data) ? data : []);

      } catch (err) {

        console.error(err);

      }

    };

    fetchUsers();

  }, [token]);

  /* ================= ADD FRIEND ================= */

  const handleAddFriend = async (userId) => {

    try {

      const res = await fetch(
        `${API_BASE}/api/friends/request/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed");
      }

      setFriendStatuses((prev) => ({
        ...prev,
        [userId]: "pending",
      }));

    } catch (err) {

      console.error(err);

      alert("Failed to send friend request");

    }

  };

  /* ================= SEARCH ================= */

  const filteredUsers = users.filter((user) =>
    user?.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (

    <div className="max-w-md mx-auto mt-6 space-y-5">

      {/* HEADER */}

      <div>

        <h2 className="text-2xl font-bold">
          Add Friends
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Connect with real people on AfricSocial
        </p>

      </div>

      {/* SEARCH */}

      <input
        type="text"
        placeholder="Search people..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="
          w-full
          border
          rounded-xl
          px-4
          py-3
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />

      {/* USERS */}

      <div className="space-y-3">

        <h3 className="font-semibold text-gray-700">
          Suggested For You
        </h3>

        {filteredUsers.length === 0 && (

          <p className="text-gray-500 text-sm">
            No users found
          </p>

        )}

        {filteredUsers.map((user) => (

          <UserCard
            key={user._id}
            user={user}
            status={friendStatuses[user._id]}
            onAddFriend={() =>
              handleAddFriend(user._id)
            }
          />

        ))}

      </div>

    </div>

  );

};

export default AddFriends;