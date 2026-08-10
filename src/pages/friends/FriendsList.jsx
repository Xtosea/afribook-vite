import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, fetchWithToken } from "../../api/api";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

const FriendsList = () => {
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingPK, setCreatingPK] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await fetchWithToken(
          `${API_BASE}/friends/list`,
          token
        );

        setFriends(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load friends:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [token]);

  // ==========================================
  // CREATE PK BATTLE
  // ==========================================

  const createPKBattle = async (friend) => {
    if (!friend?._id) {
      alert("Invalid friend");
      return;
    }

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setCreatingPK(friend._id);

      const data = await fetchWithToken(
        `${API_BASE}/pk`,
        token,
        {
          method: "POST",
          body: JSON.stringify({
            hostB: friend._id,
            duration: 300,
          }),
        }
      );

      console.log("PK created:", data);

      const battleId = data?.battle?._id;

      if (!battleId) {
        throw new Error(
          "PK was created but no battle ID was returned"
        );
      }

      // Go directly to the real battle
      navigate(`/pk/${battleId}`);

    } catch (err) {
      console.error("Create PK error:", err);

      alert(
        err?.message ||
          "Failed to create PK battle"
      );

    } finally {
      setCreatingPK(null);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 space-y-4 pb-20">

      <div>
        <h1 className="text-2xl font-bold">
          Friends
        </h1>

        <p className="text-gray-500 text-sm">
          Your connections on AfricSocial
        </p>
      </div>

      {loading ? (

        <div className="space-y-3">
          <div className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>

      ) : (

        <div className="space-y-3">

          {friends.length === 0 && (
            <p className="text-gray-500">
              No friends yet
            </p>
          )}

          {friends.map((friend) => (

            <div
              key={friend._id}
              className="
                bg-white
                border
                rounded-2xl
                shadow-sm
                p-3
                flex
                items-center
                justify-between
              "
            >

              {/* Friend information */}

              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() =>
                  navigate(`/profile/${friend._id}`)
                }
              >

                <img
                  src={
                    friend.profilePic ||
                    defaultProfile
                  }
                  onError={(e) => {
                    e.target.src = defaultProfile;
                  }}
                  className="
                    w-14
                    h-14
                    rounded-full
                    object-cover
                  "
                  alt={friend.name || "Friend"}
                />

                <div>

                  <h3 className="font-semibold">
                    {friend.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Friend
                  </p>

                </div>

              </div>

              {/* Actions */}

              <div className="flex flex-col gap-2">

                {/* MESSAGE */}

                <button
                  onClick={() =>
                    navigate(`/messages/${friend._id}`)
                  }
                  className="
                    px-4
                    py-2
                    rounded-xl
                    bg-blue-600
                    text-white
                    text-sm
                    font-medium
                    hover:bg-blue-700
                    transition
                  "
                >
                  Message
                </button>

                {/* PK BATTLE */}

                <button
                  onClick={() =>
                    createPKBattle(friend)
                  }
                  disabled={
                    creatingPK === friend._id
                  }
                  className="
                    px-4
                    py-2
                    rounded-xl
                    bg-purple-600
                    text-white
                    text-sm
                    font-medium
                    hover:bg-purple-700
                    transition
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >
                  {creatingPK === friend._id
                    ? "Creating..."
                    : "🥊 PK Battle"}
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};

export default FriendsList;