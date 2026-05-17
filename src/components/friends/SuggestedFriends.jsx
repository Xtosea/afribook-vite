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

      const token =
        localStorage.getItem("token");

      console.log("TOKEN:", token);

      const res = await fetch(
        `${API_BASE}/api/friends/suggestions`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      console.log(
        "STATUS:",
        res.status
      );

      const data =
        await res.json();

      console.log(
        "DATA:",
        data
      );

      if (!res.ok) {
        console.log(
          "FETCH FAILED"
        );

        return;
      }

      setUsers(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "FETCH ERROR:",
        err
      );

    } finally {

      setLoading(false);

    }
  };

  fetchSuggestions();

}, []);

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
  Registered user
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