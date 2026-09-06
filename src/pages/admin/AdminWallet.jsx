import React, {
  useState,
} from "react";

import {
  API_BASE,
} from "../../api/api";

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Coins,
  Search,
  Shield,
} from "lucide-react";


const AdminWallet = () => {

  const [userId, setUserId] =
    useState("");

  const [points, setPoints] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [action, setAction] =
    useState("add");

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");


  /* ================= ADJUST POINTS ================= */

  const adjustPoints = async () => {

    setError("");
    setResult(null);

    const amount =
      Number(points);

    if (!userId.trim()) {
      setError(
        "Please enter the user's ID."
      );
      return;
    }

    if (
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      setError(
        "Points must be a positive whole number."
      );
      return;
    }

    if (!reason.trim()) {
      setError(
        "Please enter a reason."
      );
      return;
    }

    try {

      setLoading(true);

      const token =
        localStorage.getItem("token");

      const res =
        await fetch(
          `${API_BASE}/api/admin/wallet/points`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              userId:
                userId.trim(),

              action,

              points:
                amount,

              reason:
                reason.trim(),
            }),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
          "Failed to adjust points."
        );
      }

      setResult(data);

      setPoints("");
      setReason("");

    } catch (err) {

      console.error(
        "ADMIN WALLET ERROR:",
        err
      );

      setError(
        err.message ||
        "Something went wrong."
      );

    } finally {

      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-black text-white pb-24">

      {/* HEADER */}

      <div className="sticky top-0 z-20 bg-black/90 backdrop-blur border-b border-gray-800 px-4 py-4">

        <div className="flex items-center gap-3">

          <Shield
            size={28}
            className="text-green-400"
          />

          <div>

            <h1 className="text-2xl font-bold">
              Admin Wallet
            </h1>

            <p className="text-sm text-gray-400">
              Manage user points
            </p>

          </div>

        </div>

      </div>


      <div className="max-w-2xl mx-auto p-4 space-y-5">

        {/* USER */}

        <div className="bg-gray-900 rounded-3xl p-5">

          <div className="flex items-center gap-2 mb-4">

            <Search
              size={20}
              className="text-gray-400"
            />

            <h2 className="font-bold">
              Target User
            </h2>

          </div>

          <label className="text-sm text-gray-400">
            User ID
          </label>

          <input
            value={userId}
            onChange={(e) =>
              setUserId(e.target.value)
            }
            placeholder="Enter user's MongoDB ID"
            className="w-full mt-2 bg-black border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-green-500"
          />

          <p className="text-xs text-gray-500 mt-2">
            Enter the user's account ID exactly.
          </p>

        </div>


        {/* ACTION */}

        <div className="bg-gray-900 rounded-3xl p-5">

          <h2 className="font-bold mb-4">
            Point Adjustment
          </h2>

          <div className="grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={() =>
                setAction("add")
              }
              className={`p-4 rounded-2xl border ${
                action === "add"
                  ? "border-green-500 bg-green-500/10"
                  : "border-gray-700"
              }`}
            >

              <ArrowUpCircle
                className="mx-auto mb-2"
              />

              <span>
                Add Points
              </span>

            </button>


            <button
              type="button"
              onClick={() =>
                setAction("deduct")
              }
              className={`p-4 rounded-2xl border ${
                action === "deduct"
                  ? "border-red-500 bg-red-500/10"
                  : "border-gray-700"
              }`}
            >

              <ArrowDownCircle
                className="mx-auto mb-2"
              />

              <span>
                Deduct Points
              </span>

            </button>

          </div>


          <div className="mt-5">

            <label className="text-sm text-gray-400">
              Points
            </label>

            <div className="relative mt-2">

              <Coins
                size={20}
                className="absolute left-3 top-3.5 text-gray-500"
              />

              <input
                type="number"
                min="1"
                step="1"
                value={points}
                onChange={(e) =>
                  setPoints(e.target.value)
                }
                placeholder="Enter points"
                className="w-full bg-black border border-gray-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-green-500"
              />

            </div>

          </div>


          <div className="mt-4">

            <label className="text-sm text-gray-400">
              Reason
            </label>

            <textarea
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              placeholder="Why are you adjusting this user's points?"
              rows="4"
              className="w-full mt-2 bg-black border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-green-500 resize-none"
            />

          </div>


          <button
            type="button"
            onClick={adjustPoints}
            disabled={loading}
            className={`w-full mt-5 py-3 rounded-2xl font-bold ${
              action === "add"
                ? "bg-green-500 text-black"
                : "bg-red-500 text-white"
            } disabled:opacity-50`}
          >

            {loading
              ? "Processing..."
              : action === "add"
              ? "Add Points"
              : "Deduct Points"}

          </button>

        </div>


        {/* ERROR */}

        {error && (

          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl p-4">

            {error}

          </div>

        )}


        {/* SUCCESS */}

        {result && (

          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5">

            <h2 className="font-bold text-green-400 mb-3">
              Points Updated
            </h2>

            <div className="space-y-2 text-sm">

              <p>
                <span className="text-gray-400">
                  User:
                </span>{" "}
                {result.userId}
              </p>

              <p>
                <span className="text-gray-400">
                  Change:
                </span>{" "}
                {result.pointsChanged > 0
                  ? "+"
                  : ""}
                {result.pointsChanged}
              </p>

              <p className="flex items-center gap-2">

                <span className="text-gray-400">
                  New Points:
                </span>

                <strong>
                  {result.points}
                </strong>

              </p>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};


export default AdminWallet;
