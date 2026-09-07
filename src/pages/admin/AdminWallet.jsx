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
  History,
  RefreshCw,
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

  const [history, setHistory] =
    useState([]);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [historyPage, setHistoryPage] =
    useState(1);

  const [historyPagination, setHistoryPagination] =
    useState({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });


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


  /* ================= LOAD ADJUSTMENT HISTORY ================= */

  const loadHistory = async (page = 1) => {

    try {

      setHistoryLoading(true);

      const token =
        localStorage.getItem("token");

      const res =
        await fetch(
          `${API_BASE}/api/admin/wallet/history?page=${page}&limit=20`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
          "Failed to load adjustment history."
        );
      }

      setHistory(
        Array.isArray(data.adjustments)
          ? data.adjustments
          : []
      );

      setHistoryPagination(
        data.pagination || {
          page,
          limit: 20,
          total: 0,
          totalPages: 0,
        }
      );

    } catch (err) {

      console.error(
        "ADMIN ADJUSTMENT HISTORY ERROR:",
        err
      );

      setError(
        err.message ||
        "Failed to load adjustment history."
      );

    } finally {

      setHistoryLoading(false);
    }
  };


  /* ================= LOAD HISTORY ON MOUNT ================= */

  useEffect(() => {
    loadHistory(historyPage);
  }, [historyPage]);


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

      setHistoryPage(1);

      await loadHistory(1);

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

        {/* ADJUSTMENT HISTORY */}

        <div className="bg-gray-900 rounded-3xl p-5">

          <div className="flex items-center justify-between gap-3 mb-4">

            <div className="flex items-center gap-2">

              <History
                size={20}
                className="text-green-400"
              />

              <div>

                <h2 className="font-bold">
                  Adjustment History
                </h2>

                <p className="text-xs text-gray-500">
                  Recent AfricSocial point updates
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                loadHistory(historyPage)
              }
              disabled={historyLoading}
              className="p-2 rounded-xl bg-black border border-gray-700 hover:border-green-500 disabled:opacity-50"
              aria-label="Refresh adjustment history"
            >

              <RefreshCw
                size={18}
                className={
                  historyLoading
                    ? "animate-spin"
                    : ""
                }
              />

            </button>

          </div>


          {historyLoading && history.length === 0 ? (

            <div className="py-10 text-center text-gray-500">

              <RefreshCw
                size={28}
                className="mx-auto mb-3 animate-spin"
              />

              <p>
                Loading adjustment history...
              </p>

            </div>

          ) : history.length === 0 ? (

            <div className="py-10 text-center text-gray-500">

              <History
                size={32}
                className="mx-auto mb-3 opacity-50"
              />

              <p>
                No point adjustments yet.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {history.map((item) => {

                const isAdd =
                  item.action === "add";

                const points =
                  Math.abs(
                    Number(item.points || 0)
                  );

                return (

                  <div
                    key={item._id}
                    className="bg-black/50 border border-gray-800 rounded-2xl p-4"
                  >

                    <div className="flex items-start gap-3">

                      {item.user?.profilePic ? (

                        <img
                          src={item.user.profilePic}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                        />

                      ) : (

                        <div className="w-11 h-11 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">

                          <User
                            size={20}
                            className="text-gray-500"
                          />

                        </div>

                      )}


                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <p className="font-semibold truncate">
                              {item.user?.name ||
                                "Unnamed User"}
                            </p>

                            <p className="text-xs text-gray-500 truncate">
                              {item.user?.email ||
                                item.user?.phone ||
                                item.user?._id ||
                                "Unknown user"}
                            </p>

                          </div>


                          <span
                            className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                              isAdd
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >

                            {isAdd
                              ? "Added"
                              : "Deducted"}

                          </span>

                        </div>


                        <div className="flex items-center justify-between gap-3 mt-3">

                          <div>

                            <p
                              className={`text-xl font-bold ${
                                isAdd
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >

                              {isAdd ? "+" : "-"}
                              {points.toLocaleString()}

                            </p>

                            <p className="text-xs text-gray-500">
                              points
                            </p>

                          </div>


                          <div className="text-right">

                            <p className="text-xs text-gray-400">
                              {item.createdAt
                                ? new Date(
                                    item.createdAt
                                  ).toLocaleString()
                                : "Unknown date"}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              By{" "}
                              {item.admin?.name ||
                                "AfricSocial"}
                            </p>

                          </div>

                        </div>


                        {item.reason && (

                          <div className="mt-3 pt-3 border-t border-gray-800">

                            <p className="text-xs text-gray-500 mb-1">
                              Reason
                            </p>

                            <p className="text-sm text-gray-300 break-words">
                              {item.reason}
                            </p>

                          </div>

                        )}

                      </div>

                    </div>

                  </div>

                );

              })}

            </div>

          )}


          {historyPagination.totalPages > 1 && (

            <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-800">

              <button
                type="button"
                onClick={() =>
                  setHistoryPage(
                    previous =>
                      Math.max(
                        previous - 1,
                        1
                      )
                  )
                }
                disabled={
                  historyLoading ||
                  historyPage <= 1
                }
                className="px-4 py-2 rounded-xl bg-black border border-gray-700 text-sm disabled:opacity-40"
              >
                Previous
              </button>


              <p className="text-xs text-gray-400 text-center">

                Page{" "}

                <span className="text-white font-semibold">
                  {historyPagination.page}
                </span>

                {" "}of{" "}

                <span className="text-white font-semibold">
                  {historyPagination.totalPages}
                </span>

              </p>


              <button
                type="button"
                onClick={() =>
                  setHistoryPage(
                    previous =>
                      Math.min(
                        previous + 1,
                        historyPagination.totalPages
                      )
                  )
                }
                disabled={
                  historyLoading ||
                  historyPage >=
                    historyPagination.totalPages
                }
                className="px-4 py-2 rounded-xl bg-black border border-gray-700 text-sm disabled:opacity-40"
              >
                Next
              </button>

            </div>

          )}


          {historyPagination.total > 0 && (

            <p className="text-xs text-gray-600 text-center mt-3">

              Showing{" "}
              {history.length} of{" "}
              {historyPagination.total} adjustments

            </p>

          )}

        </div>

      </div>

    </div>
  );
};


export default AdminWallet;
