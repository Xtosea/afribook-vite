import React, { useEffect, useState } from "react";
import { API_BASE, fetchWithToken } from "../../api/api";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

const FriendRequests = () => {

  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchRequests = async () => {

      try {

        const data = await fetchWithToken(
          `${API_BASE}/api/friends/requests`,
          token
        );

        setRequests(Array.isArray(data) ? data : []);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    };

    fetchRequests();

  }, [token]);

  const acceptRequest = async (userId) => {

    try {

      const res = await fetch(
        `${API_BASE}/api/friends/accept/${userId}`,
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

      setRequests((prev) =>
        prev.filter((u) => u._id !== userId)
      );

    } catch (err) {

      console.error(err);

      alert("Failed to accept request");

    }

  };

  const declineRequest = async (userId) => {

    try {

      const res = await fetch(
        `${API_BASE}/api/friends/decline/${userId}`,
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

      setRequests((prev) =>
        prev.filter((u) => u._id !== userId)
      );

    } catch (err) {

      console.error(err);

      alert("Failed to decline request");

    }

  };

  return (

    <div className="max-w-md mx-auto mt-6 space-y-4 pb-20">

      <div>

        <h1 className="text-2xl font-bold">
          Friend Requests
        </h1>

        <p className="text-gray-500 text-sm">
          People who want to connect with you
        </p>

      </div>

      {loading ? (

        <div className="space-y-3">
          <div className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>

      ) : (

        <div className="space-y-3">

          {requests.length === 0 && (

            <p className="text-gray-500">
              No friend requests
            </p>

          )}

          {requests.map((user) => (

            <div
              key={user._id}
              className="bg-white rounded-2xl shadow-sm border p-3"
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <img
                    src={user.profilePic || defaultProfile}
                    onError={(e) => {
                      e.target.src = defaultProfile;
                    }}
                    className="w-14 h-14 rounded-full object-cover"
                  />

                  <div>

                    <h3 className="font-semibold">
                      {user.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      Sent you a request
                    </p>

                  </div>

                </div>

              </div>

              <div className="flex gap-2 mt-4">

                <button
                  onClick={() => acceptRequest(user._id)}
                  className="
                    flex-1
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    py-2
                    rounded-xl
                    font-medium
                  "
                >
                  Accept
                </button>

                <button
                  onClick={() => declineRequest(user._id)}
                  className="
                    flex-1
                    bg-gray-200
                    hover:bg-gray-300
                    py-2
                    rounded-xl
                    font-medium
                  "
                >
                  Decline
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

};

export default FriendRequests;