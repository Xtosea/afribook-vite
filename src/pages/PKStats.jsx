import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  API_BASE,
  fetchWithToken,
} from "../api/api.js";


export default function PKStats() {

  const navigate = useNavigate();

  const token =
    localStorage.getItem("token");

  const [stats, setStats] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    const loadStats = async () => {

      if (!token) {
        setError(
          "Please log in to view PK statistics."
        );

        setLoading(false);

        return;
      }

      try {

        const data =
          await fetchWithToken(
            `${API_BASE}/api/pk/stats`,
            token
          );

        setStats(
          data?.stats || null
        );

      } catch (err) {

        console.error(
          "PK stats error:",
          err
        );

        setError(
          err?.message ||
          "Failed to load PK statistics"
        );

      } finally {

        setLoading(false);

      }

    };

    loadStats();

  }, [token]);


  if (loading) {

    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">
            📊
          </div>
          <p>
            Loading PK statistics...
          </p>
        </div>
      </div>
    );

  }


  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-6 pb-24">

      <div className="max-w-3xl mx-auto">

        {/* HEADER */}

        <div className="flex items-center gap-3 mb-6">

          <button
            onClick={() =>
              navigate(-1)
            }
            className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800"
          >
            ←
          </button>

          <div>

            <h1 className="text-2xl font-black">
              📊 PK Statistics
            </h1>

            <p className="text-sm text-gray-400">
              Your PK performance
            </p>

          </div>

        </div>


        {error && (

          <div className="mb-5 p-4 rounded-xl bg-red-950 border border-red-800 text-red-300">
            ❌ {error}
          </div>

        )}


        {!stats ? (

          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-8 text-center">
            No statistics available.
          </div>

        ) : (

          <>

            {/* MAIN STATS */}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

              <Stat
                icon="🥊"
                label="Battles"
                value={stats.totalBattles}
              />

              <Stat
                icon="🏆"
                label="Wins"
                value={stats.wins}
              />

              <Stat
                icon="❌"
                label="Losses"
                value={stats.losses}
              />

              <Stat
                icon="🤝"
                label="Draws"
                value={stats.draws}
              />

              <Stat
                icon="📈"
                label="Win Rate"
                value={`${stats.winRate}%`}
              />

              <Stat
                icon="⭐"
                label="Total Points"
                value={stats.totalPointsScored}
              />

            </div>


            {/* BEST SCORE */}

            <div className="mt-4 rounded-2xl bg-gradient-to-r from-purple-700 to-blue-700 p-6">

              <p className="text-sm text-white/70">
                Best PK Score
              </p>

              <div className="text-5xl font-black mt-1">
                {stats.bestScore}
              </div>

            </div>


            {/* NAVIGATION */}

            <div className="grid grid-cols-2 gap-3 mt-5">

              <button
                onClick={() =>
                  navigate("/pk/history")
                }
                className="py-3 rounded-xl bg-gray-900 border border-gray-800 font-bold"
              >
                📜 History
              </button>

              <button
                onClick={() =>
                  navigate(-1)
                }
                className="py-3 rounded-xl bg-blue-600 font-bold"
              >
                🥊 Back to PK
              </button>

            </div>

          </>

        )}

      </div>

    </div>
  );
}


function Stat({
  icon,
  label,
  value,
}) {

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-5">

      <div className="text-2xl">
        {icon}
      </div>

      <div className="text-2xl font-black mt-2">
        {value}
      </div>

      <div className="text-xs text-gray-500 mt-1">
        {label}
      </div>

    </div>
  );
}