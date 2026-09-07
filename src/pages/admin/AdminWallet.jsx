import React, {
  useEffect,
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
  User,
  X,
} from "lucide-react";


const AdminWallet = () => {

  const [search, setSearch] =
    useState("");

  const [users, setUsers] =
    useState([]);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [searchLoading, setSearchLoading] =
    useState(false);

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


  /* ================= SEARCH USERS ================= */

  useEffect(() => {

    if (selectedUser) {
      return;
    }

    const query =
      search.trim();

    if (query.length < 2) {
      setUsers([]);
      setSearchLoading(false);
      return;
    }

    const controller =
      new AbortController();

    const timer =
      setTimeout(async () => {

        try {

          setSearchLoading(true);
          setError("");

          const token =
            localStorage.getItem("token");

          const res =
            await fetch(
              `${API_BASE}/api/admin/wallet/users?search=${encodeURIComponent(query)}`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
                signal:
                  controller.signal,
              }
            );

          const data =
            await res.json();

          if (!res.ok) {
            throw new Error(
              data.error ||
              "Failed to search users."
            );
          }

          setUsers(
            Array.isArray(data.users)
              ? data.users
              : []
          );

        } catch (err) {

          if (
            err.name ===
            "AbortError"
          ) {
            return;
          }

          console.error(
            "ADMIN USER SEARCH ERROR:",
            err
          );

          setError(
            err.message ||
            "Failed to search users."
          );

          setUsers([]);

        } finally {

          setSearchLoading(false);
        }

      }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };

  }, [search, selectedUser]);


  /* ================= SELECT USER ================= */

  const selectUser = (user) => {

    setSelectedUser(user);
    setSearch(user.name || "");
    setUsers([]);
    setError("");
    setResult(null);
  };


  /* ================= CLEAR USER ================= */

  const clearSelectedUser = () => {

    setSelectedUser(null);
    setSearch("");
    setUsers([]);
    setResult(null);
    setError("");
  };


  /* ================= ADJUST POINTS ================= */

  const adjustPoints = async () => {

    setError("");
    setResult(null);

    const amount =
      Number(points);

    if (!selectedUser?._id) {
      setError(
        "Please search for and select a user."
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

    if (
      action === "deduct" &&
      amount > Number(selectedUser.points || 0)
    ) {
      setError(
        "The user does not have enough points for this deduction."
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
                selectedUser._id,

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

      setSelectedUser(
        previous => ({
          ...previous,
          points:
            Number(data.points || 0),
        })
      );

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

        {/* USER SEARCH */}

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


          {!selectedUser ? (

            <div className="relative">

              <label className="text-sm text-gray-400">
                Search User
              </label>

              <div className="relative mt-2">

                <Search
                  size={19}
                  className="absolute left-3 top-3.5 text-gray-500"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search name, email or phone..."
                  autoComplete="off"
                  className="w-full bg-black border border-gray-700 rounded-xl pl-10 pr-10 py-3 outline-none focus:border-green-500"
                />

                {searchLoading && (

                  <div className="absolute right-3 top-3.5">

                    <div className="w-5 h-5 border-2 border-gray-600 border-t-green-400 rounded-full animate-spin" />

                  </div>

                )}

              </div>


              {/* SEARCH DROPDOWN */}

              {search.trim().length >= 2 &&
                !searchLoading && (

                <div className="absolute left-0 right-0 mt-2 z-30 bg-gray-950 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">

                  {users.length > 0 ? (

                    users.map(user => (

                      <button
                        key={user._id}
                        type="button"
                        onClick={() =>
                          selectUser(user)
                        }
                        className="w-full text-left px-4 py-3 hover:bg-gray-800 border-b border-gray-800 last:border-b-0 flex items-center gap-3"
                      >

                        {user.profilePic ? (

                          <img
                            src={user.profilePic}
                            alt=""
                            className="w-11 h-11 rounded-full object-cover"
                          />

                        ) : (

                          <div className="w-11 h-11 rounded-full bg-gray-800 flex items-center justify-center">

                            <User
                              size={20}
                              className="text-gray-500"
                            />

                          </div>

                        )}


                        <div className="min-w-0 flex-1">

                          <p className="font-semibold truncate">
                            {user.name || "Unnamed User"}
                          </p>

                          <p className="text-xs text-gray-400 truncate">
                            {user.email ||
                              user.phone ||
                              "No contact information"}
                          </p>

                          <p className="text-xs text-green-400 mt-1">
                            {Number(
                              user.points || 0
                            ).toLocaleString()}{" "}
                            points
                          </p>

                        </div>

                      </button>

                    ))

                  ) : (

                    <div className="px-4 py-5 text-center text-sm text-gray-500">
                      No users found.
                    </div>

                  )}

                </div>

              )}

            </div>

          ) : (

            /* SELECTED USER */

            <div className="border border-green-500/40 bg-green-500/5 rounded-2xl p-4">

              <div className="flex items-center gap-3">

                {selectedUser.profilePic ? (

                  <img
                    src={selectedUser.profilePic}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover"
                  />

                ) : (

                  <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">

                    <User
                      size={24}
                      className="text-gray-500"
                    />

                  </div>

                )}


                <div className="min-w-0 flex-1">

                  <p className="font-bold truncate">
                    {selectedUser.name ||
                      "Unnamed User"}
                  </p>

                  <p className="text-sm text-gray-400 truncate">
                    {selectedUser.email ||
                      selectedUser.phone ||
                      "No contact information"}
                  </p>

                </div>


                <button
                  type="button"
                  onClick={clearSelectedUser}
                  className="p-2 rounded-full hover:bg-gray-800"
                  aria-label="Change user"
                >
                  <X size={20} />
                </button>

              </div>


              <div className="mt-4 bg-black/40 rounded-xl p-4">

                <p className="text-xs text-gray-500">
                  Current Points
                </p>

                <p className="text-3xl font-bold text-green-400 mt-1">
                  {Number(
                    selectedUser.points || 0
                  ).toLocaleString()}
                </p>

              </div>

            </div>

          )}

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
            disabled={
              loading ||
              !selectedUser
            }
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
                {selectedUser?.name ||
                  result.userId}
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
                  {Number(
                    result.points || 0
                  ).toLocaleString()}
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
