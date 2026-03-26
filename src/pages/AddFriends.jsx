import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddFriends() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([
    { id: 1, name: "UBGold" },
    { id: 2, name: "Goodnews" },
    { id: 3, name: "Daddy P" },
  ]);

  const addFriend = (friendId) => {
    alert(`Friend with ID ${friendId} added!`);
    // TODO: call backend to actually add friend
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Add Friends</h1>
      <p className="mb-4 text-gray-600">Suggested friends to connect with:</p>

      <ul className="space-y-3">
        {friends.map((f) => (
          <li key={f.id} className="flex justify-between items-center border p-3 rounded-lg">
            <span>{f.name}</span>
            <button
              onClick={() => addFriend(f.id)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Add Friend
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => navigate("/welcome")}
          className="underline text-gray-600"
        >
          Back
        </button>
        <button
          onClick={() => navigate("/sync-contacts")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Next: Sync Contacts
        </button>
      </div>
    </div>
  );
}