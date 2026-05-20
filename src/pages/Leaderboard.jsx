import React, {
  useEffect,
  useState,
} from "react";

import {
  API_BASE,
} from "../api/api";

import {
  useNavigate,
} from "react-router-dom";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

const Leaderboard = () => {

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const navigate =
    useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard =
    async () => {

      try {

        const res = await fetch(
          `${API_BASE}/api/leaderboard/top`
        );

        const data =
          await res.json();

        setUsers(data);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

  if (loading) {
    return (
      <div className="text-white p-4">
        Loading leaderboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">

      {/* HEADER */}

      <h1 className="text-3xl font-bold mb-6">
        Top Earners
      </h1>

      {/* TOP 3 */}

      {users.length >= 3 && (

        <div className="grid grid-cols-3 gap-3 mb-8">

          {/* 2ND */}

          <div className="bg-gray-900 rounded-xl p-3 text-center mt-6">

            <img
              src={
                users[1]?.profilePic ||
                defaultProfile
              }
              alt=""
              className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-gray-400"
            />

            <h2 className="font-bold mt-2">
              #{users[1]?.rank}
            </h2>

            <p className="text-sm">
              {users[1]?.name}
            </p>

            <p className="text-green-400 font-bold">
              {users[1]?.points} pts
            </p>

          </div>

          {/* 1ST */}

          <div className="bg-yellow-500 rounded-xl p-4 text-center">

            <img
              src={
                users[0]?.profilePic ||
                defaultProfile
              }
              alt=""
              className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white"
            />

            <h2 className="font-bold text-xl mt-2">
              👑 #1
            </h2>

            <p>
              {users[0]?.name}
            </p>

            <p className="font-bold">
              {users[0]?.points} pts
            </p>

          </div>

          {/* 3RD */}

          <div className="bg-gray-900 rounded-xl p-3 text-center mt-10">

            <img
              src={
                users[2]?.profilePic ||
                defaultProfile
              }
              alt=""
              className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-orange-400"
            />

            <h2 className="font-bold mt-2">
              #{users[2]?.rank}
            </h2>

            <p className="text-sm">
              {users[2]?.name}
            </p>

            <p className="text-green-400 font-bold">
              {users[2]?.points} pts
            </p>

          </div>

        </div>
      )}

      {/* ALL USERS */}

      <div className="space-y-3">

        {users.map((user) => (

          <div
            key={user.userId}
            onClick={() =>
              navigate(
                `/profile/${user.userId}`
              )
            }
            className="bg-gray-900 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-gray-800 transition"
          >

            <div className="flex items-center gap-3">

              <div className="text-lg font-bold w-8">
                #{user.rank}
              </div>

              <img
                src={
                  user.profilePic ||
                  defaultProfile
                }
                alt=""
                className="w-14 h-14 rounded-full object-cover"
              />

              <div>

                <h2 className="font-semibold">
                  {user.name}
                </h2>

                <p className="text-sm text-gray-400">
                  {user.intro ||
                    "Afribook User"}
                </p>

              </div>
            </div>

            <div className="text-right">

              <p className="text-green-400 font-bold">
                {user.points}
              </p>

              <p className="text-xs text-gray-400">
                points
              </p>

            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;