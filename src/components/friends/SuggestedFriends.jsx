import React, { useEffect, useState } from "react";
import { API_BASE } from "../../api/api";
import { useNavigate } from "react-router-dom";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

const SuggestedFriends = ({
  limit = 10,
}) => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState({});

  /* ================= FETCH USERS ================= */

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
              Authorization: `Bearer ${token}`,
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

        // RANDOMIZE USERS
        const shuffledUsers =
          Array.isArray(data)
            ? [...data].sort(
                () =>
                  0.5 - Math.random()
              )
            : [];

        setUsers(shuffledUsers);

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

  /* ================= ADD FRIEND ================= */

  const handleAddFriend = async (
    userId
  ) => {

    try {

      setSending((prev) => ({
        ...prev,
        [userId]: true,
      }));

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/friends/request/${userId}`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await res.json();

      console.log(data);

      if (!res.ok) {

        alert(
          data.error ||
          "Failed to send request"
        );

        return;
      }

      // REMOVE USER AFTER REQUEST
      setUsers((prev) =>
        prev.filter(
          (u) => u._id !== userId
        )
      );

      alert(
        "Friend request sent"
      );

    } catch (err) {

      console.error(err);

      alert(
        "Failed to send request"
      );

    } finally {

      setSending((prev) => ({
        ...prev,
        [userId]: false,
      }));

    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <h2 className="font-bold text-lg">
          People You May Know
        </h2>

        <button
          onClick={() =>
            navigate("/friends")
          }
          className="text-blue-600 text-sm"
        >
          See all
        </button>

      </div>

      {/* LOADING */}
      {loading ? (

        <div className="flex gap-4 overflow-hidden">

          <div className="min-w-[220px] h-48 bg-gray-200 rounded-2xl animate-pulse"></div>

          <div className="min-w-[220px] h-48 bg-gray-200 rounded-2xl animate-pulse"></div>

        </div>

      ) : (
        <>
          {/* EMPTY */}
          {users.length === 0 ? (

            <p className="text-gray-500 text-sm">
              No suggestions right now
            </p>

          ) : (

            <div
              className="
                flex
                gap-4
                overflow-x-auto
                scrollbar-hide
                pb-2
              "
            >
              {users
                .slice(0, limit)
                .map((user) => (

                  <div
                    key={user._id}
                    className="
                      min-w-[220px]
                      bg-gray-50
                      rounded-2xl
                      p-3
                      flex-shrink-0
                      border
                    "
                  >

                    {/* USER INFO */}
                    <div
                      className="
                        flex
                        flex-col
                        items-center
                        text-center
                        cursor-pointer
                      "
                      onClick={() =>
                        navigate(
                          `/profile/${user._id}`
                        )
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
                        alt={user.name}
                        className="
                          w-16
                          h-16
                          rounded-full
                          object-cover
                          mb-2
                        "
                      />

                      <h3 className="font-semibold text-sm">
                        {user.name}
                      </h3>

                      <p className="text-xs text-gray-500 mb-3">
                        Registered user
                      </p>

                    </div>

                    {/* ADD BUTTON */}
                    <button
                      onClick={() =>
                        handleAddFriend(
                          user._id
                        )
                      }
                      disabled={
                        sending[user._id]
                      }
                      className="
                        w-full
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        py-2
                        rounded-xl
                        text-sm
                        font-medium
                      "
                    >
                      {sending[user._id]
                        ? "Sending..."
                        : "Add Friend"}
                    </button>

                  </div>
                ))}
            </div>

          )}
        </>
      )}
    </div>
  );
};

export default SuggestedFriends;