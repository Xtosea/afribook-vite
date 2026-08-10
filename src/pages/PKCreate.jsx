import React, { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { API_BASE, fetchWithToken } from "../api/api";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

const DURATIONS = [
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 120, label: "2 minutes" },
  { value: 180, label: "3 minutes" },
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" },
  { value: 900, label: "15 minutes" },
  { value: 1800, label: "30 minutes" },
  { value: 3600, label: "1 hour" },
];

export default function PKCreate() {
  const navigate = useNavigate();
const location = useLocation();

const friendFromState =
  location.state?.friend || null;

  const token = localStorage.getItem("token");

  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] =
  useState(friendFromState);
  const [duration, setDuration] = useState(300);

  const [loadingFriends, setLoadingFriends] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFriends = async () => {
      try {
        setLoadingFriends(true);
        setError("");

        const data = await fetchWithToken(
          `${API_BASE}/api/friends/list`,
          token
        );

        setFriends(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load friends:", err);
        setError(err.message || "Failed to load friends");
      } finally {
        setLoadingFriends(false);
      }
    };

    if (token) {
      loadFriends();
    } else {
      setLoadingFriends(false);
      setError("Please log in to create a PK battle.");
    }
  }, [token]);

  const createBattle = async () => {
  if (!selectedFriend?._id) {
    setError("Please select an opponent.");
    return;
  }

  if (!token) {
    setError("Please log in to create a PK battle.");
    return;
  }

  try {
    setCreating(true);
    setError("");

    console.log("🥊 Creating PK:", {
      hostB: selectedFriend._id,
      duration,
    });

    const data = await fetchWithToken(
      `${API_BASE}/api/pk`,
      token,
      {
        method: "POST",
        body: JSON.stringify({
          hostB: selectedFriend._id,
          duration,
        }),
      }
    );

    console.log("🥊 PK creation response:", data);

    const battleId =
      data?.battle?._id ||
      data?.battle?.id;

    if (!battleId) {
      throw new Error(
        "PK was created but no battle ID was returned."
      );
    }

    console.log(
      "🥊 PK battle created:",
      battleId
    );

    navigate(`/pk/${battleId}`);

  } catch (err) {
    console.error(
      "Create PK error:",
      err
    );

    setError(
      err?.message ||
      "Failed to create PK battle"
    );

  } finally {
    setCreating(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 pb-24">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white border shadow-sm flex items-center justify-center"
          >
            ←
          </button>

          <div>
            <h1 className="text-2xl font-bold">
              🥊 Create PK Battle
            </h1>

            <p className="text-sm text-gray-500">
              Challenge a friend to a live battle
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Opponent */}
        <section className="bg-white rounded-2xl shadow-sm border p-4 mb-5">
          <h2 className="font-semibold text-lg mb-1">
            Choose opponent
          </h2>

          <p className="text-sm text-gray-500 mb-4">
            Select one of your friends.
          </p>

          {loadingFriends ? (
            <div className="space-y-3">
              <div className="h-16 rounded-xl bg-gray-200 animate-pulse" />
              <div className="h-16 rounded-xl bg-gray-200 animate-pulse" />
              <div className="h-16 rounded-xl bg-gray-200 animate-pulse" />
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">👥</div>

              <p className="font-medium">
                You don't have any friends yet.
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Add friends before starting a PK battle.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {friends.map((friend) => {
                const selected =
                  selectedFriend?._id === friend._id;

                return (
                  <button
                    key={friend._id}
                    type="button"
                    onClick={() => setSelectedFriend(friend)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                      selected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <img
                      src={
                        friend.profilePic ||
                        defaultProfile
                      }
                      onError={(e) => {
                        e.currentTarget.src =
                          defaultProfile;
                      }}
                      alt={friend.name || "Friend"}
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {friend.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        Friend
                      </p>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selected
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {selected && (
                        <span className="text-white text-sm">
                          ✓
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Selected opponent */}
        {selectedFriend && (
          <section className="bg-white rounded-2xl shadow-sm border p-4 mb-5">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">
              Selected opponent
            </p>

            <div className="flex items-center gap-3">
              <img
                src={
                  selectedFriend.profilePic ||
                  defaultProfile
                }
                onError={(e) => {
                  e.currentTarget.src =
                    defaultProfile;
                }}
                alt={selectedFriend.name}
                className="w-14 h-14 rounded-full object-cover"
              />

              <div>
                <p className="font-bold">
                  {selectedFriend.name}
                </p>

                <p className="text-sm text-gray-500">
                  Your PK opponent
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Duration */}
        <section className="bg-white rounded-2xl shadow-sm border p-4 mb-5">
          <h2 className="font-semibold text-lg mb-1">
            ⏱️ Battle duration
          </h2>

          <p className="text-sm text-gray-500 mb-4">
            Choose how long the PK should last.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DURATIONS.map((item) => {
              const selected =
                duration === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    setDuration(item.value)
                  }
                  className={`p-3 rounded-xl border text-sm font-medium transition ${
                    selected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Create */}
        <button
          type="button"
          disabled={
            creating ||
            !selectedFriend ||
            loadingFriends
          }
          onClick={createBattle}
          className={`w-full py-4 rounded-2xl font-bold text-white shadow-sm transition ${
            creating ||
            !selectedFriend ||
            loadingFriends
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]"
          }`}
        >
          {creating
            ? "Creating PK..."
            : selectedFriend
            ? `🥊 Challenge ${selectedFriend.name}`
            : "Select an opponent"}
        </button>

      </div>
    </div>
  );
}