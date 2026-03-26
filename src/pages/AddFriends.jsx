// src/pages/onboarding/AddFriends.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddFriends() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [importedFriends, setImportedFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  const importFromFacebook = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/social/facebook-friends", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setImportedFriends(data.friends || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch Facebook friends");
    } finally {
      setLoading(false);
    }
  };

  const importFromInstagram = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/social/instagram-followers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setImportedFriends(data.followers || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch Instagram followers");
    } finally {
      setLoading(false);
    }
  };

  const importFromTikTok = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/social/tiktok-followers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setImportedFriends(data.followers || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch TikTok followers");
    } finally {
      setLoading(false);
    }
  };

  const addFriend = (friend) => {
    alert(`Added ${friend.name} as a friend!`);
    // Here you can call backend to actually add friend
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg w-full text-center space-y-6">
        <h2 className="text-2xl font-bold">Add Friends</h2>
        <p className="text-gray-600">Import friends from social media or skip this step.</p>

        <div className="space-y-3">
          <button
            onClick={importFromFacebook}
            className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Loading..." : "Import from Facebook"}
          </button>

          <button
            onClick={importFromInstagram}
            className="w-full bg-pink-500 text-white py-2 rounded-xl font-semibold hover:bg-pink-600 transition"
          >
            {loading ? "Loading..." : "Import from Instagram"}
          </button>

          <button
            onClick={importFromTikTok}
            className="w-full bg-black text-white py-2 rounded-xl font-semibold hover:bg-gray-800 transition"
          >
            {loading ? "Loading..." : "Import from TikTok"}
          </button>
        </div>

        {importedFriends.length > 0 && (
          <div className="mt-4 max-h-64 overflow-y-auto">
            {importedFriends.map((friend, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-gray-100 p-2 rounded mb-2"
              >
                <span>{friend.name}</span>
                <button
                  onClick={() => addFriend(friend)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate("/sync-contacts")}
          className="mt-4 text-gray-500 underline"
        >
          Skip
        </button>
      </div>
    </div>
  );
}