import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE, fetchWithToken } from "../api/api";

export default function AddFriends() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    const fetchSuggested = async () => {
      if (!token) return;
      try {
        const res = await fetchWithToken(`${API_BASE}/api/users/suggested`, token);
        setSuggestedUsers(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSuggested();
  }, [token]);

  const handleAddFriend = async (userId) => {
    try {
      await fetch(`${API_BASE}/api/friends/add/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuggestedUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 bg-blue-50 py-10">
      <h1 className="text-3xl font-bold mb-4">👥 Add Friends</h1>
      <p className="text-gray-600 mb-6 text-center">
        Find friends on Afribook. Connect now!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
        {suggestedUsers.length === 0 && <p>No suggestions for now.</p>}
        {suggestedUsers.map((user) => (
          <div key={user._id} className="bg-white p-4 rounded-xl flex items-center justify-between shadow">
            <div>
              <p className="font-semibold">{user.name}</p>
            </div>
            <button
              onClick={() => handleAddFriend(user._id)}
              className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/sync-contacts")}
        className="mt-8 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition"
      >
        Next: Sync Contacts
      </button>

      <button
        onClick={() => navigate("/")}
        className="mt-4 bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-400 transition"
      >
        Skip / Go to Home
      </button>
    </div>
  );
}