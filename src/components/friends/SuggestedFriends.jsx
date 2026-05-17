import React, { useEffect, useState } from "react";
import { API_BASE, fetchWithToken } from "../../api/api";
import { useNavigate } from "react-router-dom";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

const SuggestedFriends = () => {
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState({});

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await fetchWithToken(
          `${API_BASE}/api/friends/suggestions`,
          token
        );

     console.log("SUGGESTIONS:", data);

        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [token]);

  const handleAddFriend = async (userId) => {
    try {
      setSending((prev) => ({
        ...prev,
        [userId]: true,
      }));

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
        alert(data.error || "Failed");
        return;
      }

      setUsers((prev) =>
        prev.filter((u) => u._id !== userId)
      );

    } catch (err) {
      console.error(err);

      alert("Failed to send request");
    } finally {
      setSending((prev) => ({
        ...prev,
        [userId]: false,
      }));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 space-y-4">

      <div className="flex items-center justify-between">

        <h2 className="font-bold text-lg">
          People You May Know
        </h2>

        <button
          onClick={() => navigate("/friends")}
          className="text-blue-600 text-sm"
        >
          See all
        </button>

      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      ) : (
        <>
          {users.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No suggestions right now
            </p>
          ) : (
            users.slice(0, 5).map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between"
              >

                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() =>
                    navigate(`/profile/${user._id}`)
                  }
                >

                  <img
                    src={
                      user.profilePic ||
                      defaultProfile
                    }
                    onError={(e) => {
                      e.target.src =
                        defaultProfile;
                    }}
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div>
                    <h3 className="font-semibold text-sm">
                      {user.name}
                    </h3>

                    <p className="text-xs text-gray-500">
                      Suggested for you
                    </p>
                  </div>

                </div>

                <button
                  onClick={() =>
                    handleAddFriend(user._id)
                  }
                  disabled={sending[user._id]}
                  className="
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    px-3
                    py-1
                    rounded-lg
                    text-sm
                  "
                >
                  {sending[user._id]
                    ? "Sending..."
                    : "Add"}
                </button>

              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default SuggestedFriends;