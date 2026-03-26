import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddFriends() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([
    { id: 1, name: "UBGold" },
    { id: 2, name: "Goodnews" },
    { id: 3, name: "Daddy P" },
  ]);

  const [importedFriends, setImportedFriends] = useState([]);

  const addFriend = (friendId) => {
    alert(`Friend with ID ${friendId} added!`);
    // TODO: call backend to actually add friend
  };

  // Mock fetching friends from social media
  const fetchSocialFriends = async (platform) => {
    // In a real app, call your backend to fetch connected friends from APIs
    const mockData = {
      facebook: [
        { id: 101, name: "FB Alice" },
        { id: 102, name: "FB Bob" },
      ],
      tiktok: [
        { id: 201, name: "TT Charlie" },
        { id: 202, name: "TT Dave" },
      ],
      instagram: [
        { id: 301, name: "IG Eve" },
        { id: 302, name: "IG Frank" },
      ],
    };

    setImportedFriends(mockData[platform]);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Add Friends</h1>
      <p className="mb-4 text-gray-600">Suggested friends to connect with:</p>

      <ul className="space-y-3 mb-6">
        {friends.map((f) => (
          <li
            key={f.id}
            className="flex justify-between items-center border p-3 rounded-lg"
          >
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

      <h2 className="font-semibold mb-2">Import from Social Media</h2>
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => fetchSocialFriends("facebook")}
          className="bg-blue-700 text-white px-3 py-1 rounded"
        >
          Facebook
        </button>
        <button
          onClick={() => fetchSocialFriends("tiktok")}
          className="bg-pink-500 text-white px-3 py-1 rounded"
        >
          TikTok
        </button>
        <button
          onClick={() => fetchSocialFriends("instagram")}
          className="bg-pink-600 text-white px-3 py-1 rounded"
        >
          Instagram
        </button>
      </div>

      <ul className="space-y-2">
        {importedFriends.map((f) => (
          <li
            key={f.id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <span>{f.name}</span>
            <button
              onClick={() => addFriend(f.id)}
              className="text-blue-600"
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