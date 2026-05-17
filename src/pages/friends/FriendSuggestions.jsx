import React, { useEffect, useState } from "react";

import {
  API_BASE,
  fetchWithToken,
} from "../api/api";

const FriendSuggestions = () => {

  const token =
    localStorage.getItem("token");

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState({});

  // =========================
  // FETCH SUGGESTIONS
  // =========================

  useEffect(() => {

    const fetchSuggestions =
      async () => {

        try {

          const data =
            await fetchWithToken(
              `${API_BASE}/api/friends/suggestions`,
              token
            );

          setUsers(data || []);

        } catch (err) {

          console.error(err);

        } finally {

          setLoading(false);

        }
      };

    fetchSuggestions();

  }, [token]);

  // =========================
  // SEND FRIEND REQUEST
  // =========================

  const handleAddFriend =
    async (userId) => {

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

        const data =
          await res.json();

        if (!res.ok) {
          alert(
            data.error ||
              "Failed to send request"
          );

          return;
        }

        // remove user from suggestions
        setUsers((prev) =>
          prev.filter(
            (u) => u._id !== userId
          )
        );

      } catch (err) {

        console.error(err);

        alert(
          "Error sending friend request"
        );

      } finally {

        setSending((prev) => ({
          ...prev,
          [userId]: false,
        }));

      }
    };

  // =========================
  // UI
  // =========================

  return (

    <div className="max-w-2xl mx-auto p-4">

      <div className="mb-6">

        <h1 className="text-2xl font-bold">

          Suggested Friends

        </h1>

        <p className="text-gray-500 text-sm">

          People you may know

        </p>

      </div>

      {loading ? (

        <div className="text-center py-10">

          Loading suggestions...

        </div>

      ) : users.length === 0 ? (

        <div className="bg-white rounded-xl shadow p-6 text-center">

          <p className="text-gray-500">

            No suggestions available

          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {users.map((user) => (

            <div
              key={user._id}
              className="
                bg-white
                rounded-2xl
                shadow
                p-4
                flex
                items-center
                justify-between
              "
            >

              {/* USER INFO */}

              <div className="flex items-center gap-3">

                <img
                  src={
                    user.profilePic ||
                    "/profile/default.png"
                  }
                  alt={user.name}
                  className="
                    w-14
                    h-14
                    rounded-full
                    object-cover
                  "
                />

                <div>

                  <h2 className="font-semibold">

                    {user.name}

                  </h2>

                </div>

              </div>

              {/* BUTTON */}

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
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  px-4
                  py-2
                  rounded-xl
                  transition
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

    </div>

  );

};

export default FriendSuggestions;