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


const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";


export default function PKHistory() {

  const navigate = useNavigate();

  const token =
    localStorage.getItem("token");

  const [battles, setBattles] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    const loadHistory = async () => {

      if (!token) {
        setError(
          "Please log in to view PK history."
        );

        setLoading(false);

        return;
      }

      try {

        const data =
          await fetchWithToken(
            `${API_BASE}/api/pk/history?limit=50`,
            token
          );

        setBattles(
          Array.isArray(data?.battles)
            ? data.battles
            : []
        );

      } catch (err) {

        console.error(
          "PK history error:",
          err
        );

        setError(
          err?.message ||
          "Failed to load PK history"
        );

      } finally {

        setLoading(false);

      }

    };

    loadHistory();

  }, [token]);


  const currentUserId = (() => {

    try {

      if (!token) {
        return null;
      }

      const payload =
        JSON.parse(
          atob(
            token
              .split(".")[1]
              .replace(/-/g, "+")
              .replace(/_/g, "/")
          )
        );

      return (
        payload?.id ||
        payload?._id ||
        payload?.userId ||
        null
      );

    } catch {

      return null;

    }

  })();


  const getOpponent = (battle) => {

    const myId =
      currentUserId?.toString();

    const hostAId =
      battle?.hostA?._id?.toString();

    return hostAId === myId
      ? battle?.hostB
      : battle?.hostA;
  };


  const getMyScore = (battle) => {

    const myId =
      currentUserId?.toString();

    const hostAId =
      battle?.hostA?._id?.toString();

    return hostAId === myId
      ? battle?.hostAScore || 0
      : battle?.hostBScore || 0;
  };


  const getOpponentScore = (battle) => {

    const myId =
      currentUserId?.toString();

    const hostAId =
      battle?.hostA?._id?.toString();

    return hostAId === myId
      ? battle?.hostBScore || 0
      : battle?.hostAScore || 0;
  };


  const getResult = (battle) => {

    if (!battle.winner) {
      return {
        label: "DRAW",
        className:
          "text-yellow-400",
      };
    }

    const myId =
      currentUserId?.toString();

    const winnerId =
      battle.winner?._id?.toString() ||
      battle.winner?.toString();

    if (winnerId === myId) {
      return {
        label: "WIN",
        className:
          "text-green-400",
      };
    }

    return {
      label: "LOSS",
      className:
        "text-red-400",
    };
  };


  if (loading) {

    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">

        <div className="text-center">

          <div className="text-4xl mb-3">
            📜
          </div>

          <p>
            Loading PK history...
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
              📜 PK History
            </h1>

            <p className="text-sm text-gray-400">
              Your previous PK battles
            </p>

          </div>

        </div>


        {error && (

          <div className="mb-5 p-4 rounded-xl bg-red-950 border border-red-800 text-red-300">
            ❌ {error}
          </div>

        )}


        {battles.length === 0 ? (

          <div className="rounded-2xl bg-gray-900 border border-gray-800 p-10 text-center">

            <div className="text-5xl mb-4">
              🥊
            </div>

            <h2 className="text-xl font-bold">
              No PK battles yet
            </h2>

            <p className="text-gray-400 mt-2">
              Your completed and active battles will appear here.
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {battles.map((battle) => {

              const opponent =
                getOpponent(battle);

              const myScore =
                getMyScore(battle);

              const opponentScore =
                getOpponentScore(battle);

              const result =
                getResult(battle);

              return (

                <button
                  key={battle._id}
                  onClick={() =>
                    navigate(
                      `/pk/${battle._id}`
                    )
                  }
                  className="w-full text-left rounded-2xl bg-gray-900 border border-gray-800 p-4 hover:bg-gray-800 transition"
                >

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-3 min-w-0">

                      <img
                        src={
                          opponent?.profilePic ||
                          defaultProfile
                        }
                        onError={(e) => {
                          e.currentTarget.src =
                            defaultProfile;
                        }}
                        className="w-12 h-12 rounded-full object-cover"
                        alt=""
                      />

                      <div className="min-w-0">

                        <p className="font-bold truncate">
                          vs {opponent?.name || "Opponent"}
                        </p>

                        <p className="text-xs text-gray-500">
                          {battle.status}
                        </p>

                      </div>

                    </div>


                    <div className="text-right">

                      <div className={`font-black ${result.className}`}>
                        {result.label}
                      </div>

                      <div className="font-bold">
                        {myScore} - {opponentScore}
                      </div>

                    </div>

                  </div>


                  <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between text-xs text-gray-500">

                    <span>
                      {battle.duration || 300}s battle
                    </span>

                    <span>
                      {battle.createdAt
                        ? new Date(
                            battle.createdAt
                          ).toLocaleDateString()
                        : ""}
                    </span>

                  </div>

                </button>

              );

            })}

          </div>

        )}

      </div>

    </div>
  );
}