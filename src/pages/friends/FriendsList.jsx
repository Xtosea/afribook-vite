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

  useEffect(() => {

    const fetchFriends = async () => {

      try {

        const data = await fetchWithToken(
          `${API_BASE}/api/friends/list`,
          token
        );

        setFriends(Array.isArray(data) ? data : []);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    };

    fetchFriends();

  }, [token]);

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

              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() =>
                  navigate(`/profile/${friend._id}`)
                }
              >

                <img
                  src={friend.profilePic || defaultProfile}
                  onError={(e) => {
                    e.target.src = defaultProfile;
                  }}
                  className="w-14 h-14 rounded-full object-cover"
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

              <button
                onClick={() =>
                  navigate(`/messages/${friend._id}`)
                }
                className="
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  px-4
                  py-2
                  rounded-xl
                  text-sm
                  font-medium
                "
              >
                Message
              </button>

            </div>

          ))}

        </div>

      )}

    </div>

  );

};

export default FriendsList;