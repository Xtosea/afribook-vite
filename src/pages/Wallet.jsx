import React, {
  useEffect,
  useState,
} from "react";

import {
  API_BASE,
} from "../api/api";

import {
  useAuth,
} from "../context/AuthContext";

import {
  Wallet,
  Coins,
  Trophy,
  PlayCircle,
  Eye,
  Heart,
  Users,
  Crown,
  RefreshCcw,
  ArrowUpCircle,
  ArrowDownCircle,
  Gift,
  History,
  Loader2,
} from "lucide-react";


const WalletPage = () => {

  const {
    currentUser,
  } = useAuth();

  const isAdmin =
    currentUser?.role === "admin";

  const [wallet, setWallet] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [converting, setConverting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [transactions, setTransactions] =
    useState([]);

  const [transactionsLoading, setTransactionsLoading] =
    useState(true);

  const [transactionsError, setTransactionsError] =
    useState("");

  const [transactionPage, setTransactionPage] =
    useState(1);

  const [transactionPagination, setTransactionPagination] =
    useState(null);

  const [loadingMore, setLoadingMore] =
    useState(false);


  /* ================= FETCH WALLET ================= */

  const fetchWallet = async () => {

    try {

      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/wallet`,
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
          "Failed to load wallet"
        );
      }

      setWallet(data || {});

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);
    }
  };


  /* ================= FETCH TRANSACTIONS ================= */

  const fetchTransactions = async (
    page = 1,
    append = false
  ) => {

    try {

      if (append) {
        setLoadingMore(true);
      } else {
        setTransactionsLoading(true);
      }

      setTransactionsError("");

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/wallet/transactions?page=${page}&limit=20`,
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
          "Failed to load transaction history"
        );
      }

      const newTransactions =
        Array.isArray(data.transactions)
          ? data.transactions
          : [];

      setTransactions(prev =>
        append
          ? [...prev, ...newTransactions]
          : newTransactions
      );

      setTransactionPagination(
        data.pagination || null
      );

      setTransactionPage(page);

    } catch (err) {

      console.error(
        "TRANSACTION HISTORY ERROR:",
        err
      );

      setTransactionsError(
        err.message ||
        "Failed to load transaction history"
      );

    } finally {

      setTransactionsLoading(false);
      setLoadingMore(false);
    }
  };


  useEffect(() => {

    fetchWallet();

    fetchTransactions(1, false);

  }, []);


  /* ================= CONVERT POINTS ================= */

  const convertPoints = async () => {

    try {

      setConverting(true);

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/wallet/convert`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await res.json();

      if (!res.ok) {

        alert(
          data.error ||
          "Conversion failed"
        );

        return;
      }

      alert(
        `₦${Number(data.earned || 0).toLocaleString()} added to your balance`
      );

      await fetchWallet();

      await fetchTransactions(1, false);

    } catch (err) {

      console.error(
        "CONVERSION ERROR:",
        err
      );

      alert(
        err.message ||
        "Conversion failed"
      );

    } finally {

      setConverting(false);
    }
  };


  /* ================= LOAD MORE ================= */

  const loadMoreTransactions = () => {

    if (
      transactionPagination &&
      transactionPage <
        transactionPagination.totalPages
    ) {

      fetchTransactions(
        transactionPage + 1,
        true
      );
    }
  };


  /* ================= FORMAT DATE ================= */

  const formatTransactionDate = (
    date
  ) => {

    if (!date) {
      return "";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "";
    }

    return parsed.toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };


  /* ================= TRANSACTION TITLE ================= */

  const getTransactionTitle = (
    transaction
  ) => {

    const category =
      transaction?.category;

    const type =
      transaction?.type;

    if (
      category ===
      "admin_adjustment"
    ) {
      return "Admin Point Adjustment";
    }

    if (
      category ===
      "points_conversion" ||
      type === "conversion"
    ) {
      return "Points Conversion";
    }

    switch (category) {

      case "video_like":
        return "Video Like";

      case "video_view":
        return "Video View";

      case "reel_like":
        return "Reel Like";

      case "reel_view":
        return "Reel View";

      case "story_like":
        return "Story Like";

      case "story_view":
        return "Story View";

      case "referral":
        return "Referral Reward";

      case "leaderboard":
        return "Leaderboard Reward";

      default:
        return "Points Transaction";
    }
  };


  /* ================= TRANSACTION ICON ================= */

  const getTransactionIcon = (
    transaction
  ) => {

    const category =
      transaction?.category;

    if (
      category ===
      "admin_adjustment"
    ) {

      return (
        transaction.points >= 0
          ? <Gift size={22} />
          : <ArrowDownCircle size={22} />
      );
    }

    if (
      category ===
      "points_conversion" ||
      transaction?.type === "conversion"
    ) {
      return <Coins size={22} />;
    }

    if (
      category === "video_like" ||
      category === "reel_like" ||
      category === "story_like"
    ) {
      return <Heart size={22} />;
    }

    if (
      category === "video_view" ||
      category === "reel_view" ||
      category === "story_view"
    ) {
      return <Eye size={22} />;
    }

    if (
      category === "referral"
    ) {
      return <Users size={22} />;
    }

    if (
      category === "leaderboard"
    ) {
      return <Trophy size={22} />;
    }

    return <Coins size={22} />;
  };


  /* ================= TRANSACTION DESCRIPTION ================= */

  const getTransactionDescription = (
    transaction
  ) => {

    if (
      transaction?.description
    ) {
      return transaction.description;
    }

    if (
      transaction?.type === "conversion"
    ) {
      return "Converted points to wallet balance";
    }

    return "Points transaction";
  };


  /* ================= LOADING ================= */

  if (loading) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>

      </div>
    );
  }


  /* ================= ERROR ================= */

  if (error) {

    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 p-4">

        <p>{error}</p>

        <button
          onClick={fetchWallet}
          className="bg-green-500 px-4 py-2 rounded-lg"
        >
          Retry
        </button>

      </div>
    );
  }


  /* ================= NULL SAFETY ================= */

  if (!wallet) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        Wallet not found

      </div>
    );
  }


  return (
    <div className="min-h-screen bg-black text-white pb-24">

      {/* ================= HEADER ================= */}

      <div className="sticky top-0 z-20 bg-black/90 backdrop-blur border-b border-gray-800 px-4 py-4 flex items-center justify-between">

        <h1 className="text-2xl font-bold flex items-center gap-2">

          <Wallet size={28} />

          Wallet

        </h1>

        <button
          onClick={() => {
            fetchWallet();
            fetchTransactions(1, false);
          }}
          className="bg-gray-800 p-2 rounded-full"
        >
          <RefreshCcw size={18} />
        </button>

      </div>


      <div className="p-4 space-y-5">

        {/* ================= BALANCE CARD ================= */}

        <div className="bg-gradient-to-r from-green-500 to-emerald-700 rounded-3xl p-6 shadow-xl">

          <p className="text-sm opacity-80">
            Available Balance
          </p>

          <h2 className="text-4xl font-bold mt-2">
            ₦
            {Number(
              wallet?.balance || 0
            ).toLocaleString()}
          </h2>


          <div className="mt-5 flex items-center justify-between">

            <div>

              <p className="text-sm opacity-80">
                Total Points
              </p>

              <h3 className="text-2xl font-bold">
                {Number(
                  wallet?.points || 0
                ).toLocaleString()}
              </h3>

            </div>

            <Coins size={45} />

          </div>


          {/* ================= CONVERSION INFO ================= */}

          <div className="mt-6 rounded-2xl bg-black/40 border border-white/10 p-4">

            <p className="text-sm font-bold mb-3">
              How Your Earnings Work
            </p>

            <div className="flex items-center justify-between gap-2 text-center">

              <div className="flex-1">

                <div className="text-xl font-bold">
                  10,000
                </div>

                <p className="text-xs opacity-70">
                  Points
                </p>

              </div>

              <div className="text-lg opacity-50">
                →
              </div>

              <div className="flex-1">

                <div className="text-xl font-bold">
                  ₦5,000
                </div>

                <p className="text-xs opacity-70">
                  Cash
                </p>

              </div>

              <div className="text-lg opacity-50">
                →
              </div>

              <div className="flex-1">

                <div className="text-xl font-bold">
                  🏦
                </div>

                <p className="text-xs opacity-70">
                  Withdraw
                </p>

              </div>

            </div>

            <p className="text-xs opacity-70 mt-4 text-center">

              Reach 10,000 points to convert your points into cash.
              After conversion, your available cash can be withdrawn
              to your bank account.

            </p>

          </div>


          {/* ================= CONVERT ================= */}

          <button
            onClick={convertPoints}
            disabled={
              converting ||
              !wallet?.points ||
              (
                !isAdmin &&
                wallet.points < 10000
              )
            }
            className={`mt-4 w-full py-3 rounded-2xl font-bold transition ${
              wallet?.points > 0 &&
              (
                isAdmin ||
                wallet.points >= 10000
              )
                ? "bg-black text-white"
                : "bg-gray-400 text-gray-700"
            }`}
          >

            {converting
              ? "Converting..."
              : wallet?.points > 0 &&
                (
                  isAdmin ||
                  wallet.points >= 10000
                )
              ? "Convert to Cash"
              : "Get 10,000 Points to Convert"}

          </button>


          <p className="text-xs text-center opacity-60 mt-2">
            1 point = ₦0.50
          </p>

        </div>


        {/* ================= STATS GRID ================= */}

        <div className="grid grid-cols-2 gap-4">

          <StatCard
            title="Story Likes"
            value={wallet?.storyLikes}
            icon={<Heart />}
          />

          <StatCard
            title="Story Views"
            value={wallet?.storyViews}
            icon={<Eye />}
          />

          <StatCard
            title="Reel Likes"
            value={wallet?.reelLikes}
            icon={<Heart />}
          />

          <StatCard
            title="Reel Views"
            value={wallet?.reelViews}
            icon={<PlayCircle />}
          />

          <StatCard
            title="Video Likes"
            value={wallet?.videoLikes}
            icon={<Heart />}
          />

          <StatCard
            title="Video Views"
            value={wallet?.videoViews}
            icon={<PlayCircle />}
          />

          <StatCard
            title="Referrals"
            value={wallet?.referralPoints}
            icon={<Users />}
          />

          <StatCard
            title="Leaderboard"
            value={wallet?.leaderboardPoints}
            icon={<Trophy />}
          />

        </div>


        {/* ================= EXTRA ================= */}

        <div className="bg-gray-900 rounded-3xl p-5 space-y-4">

          <div className="flex items-center justify-between">

            <span className="text-gray-400">
              Lifetime Earned
            </span>

            <span className="font-bold text-green-400">

              ₦
              {Number(
                wallet?.lifetimeEarned || 0
              ).toLocaleString()}

            </span>

          </div>


          <div className="flex items-center justify-between">

            <span className="text-gray-400">
              Pending
            </span>

            <span className="font-bold text-yellow-400">

              ₦
              {Number(
                wallet?.pending || 0
              ).toLocaleString()}

            </span>

          </div>


          <div className="flex items-center justify-between">

            <span className="text-gray-400">
              Wallet Rank
            </span>

            <span className="font-bold flex items-center gap-1">

              <Crown
                className="text-yellow-400"
                size={18}
              />

              Top Earner

            </span>

          </div>

        </div>


        {/* ================= TRANSACTION HISTORY ================= */}

        <div className="bg-gray-900 rounded-3xl p-5">

          <div className="flex items-center justify-between mb-5">

            <div className="flex items-center gap-2">

              <History
                size={22}
              />

              <h2 className="text-xl font-bold">
                Transaction History
              </h2>

            </div>

            <button
              onClick={() =>
                fetchTransactions(
                  1,
                  false
                )
              }
              disabled={
                transactionsLoading
              }
              className="bg-gray-800 p-2 rounded-full"
            >

              <RefreshCcw
                size={17}
                className={
                  transactionsLoading
                    ? "animate-spin"
                    : ""
                }
              />

            </button>

          </div>


          {/* ================= TRANSACTION LOADING ================= */}

          {transactionsLoading ? (

            <div className="flex flex-col items-center justify-center py-10 text-gray-400">

              <Loader2
                size={30}
                className="animate-spin mb-3"
              />

              <p>
                Loading transactions...
              </p>

            </div>

          ) : transactionsError ? (

            /* ================= TRANSACTION ERROR ================= */

            <div className="text-center py-8">

              <p className="text-red-400 mb-4">
                {transactionsError}
              </p>

              <button
                onClick={() =>
                  fetchTransactions(
                    1,
                    false
                  )
                }
                className="bg-green-500 text-black font-bold px-4 py-2 rounded-xl"
              >
                Retry
              </button>

            </div>

          ) : transactions.length === 0 ? (

            /* ================= EMPTY ================= */

            <div className="text-center py-10 text-gray-500">

              <History
                size={40}
                className="mx-auto mb-3 opacity-40"
              />

              <p className="font-medium">
                No transactions yet
              </p>

              <p className="text-sm mt-1">
                Your points activity will appear here.
              </p>

            </div>

          ) : (

            /* ================= TRANSACTION LIST ================= */

            <div className="space-y-3">

              {transactions.map(
                (
                  transaction,
                  index
                ) => {

                  const points =
                    Number(
                      transaction?.points || 0
                    );

                  const amount =
                    Number(
                      transaction?.amount || 0
                    );

                  const positive =
                    points > 0;

                  const conversion =
                    transaction?.type === "conversion" ||
                    transaction?.category ===
                      "points_conversion";

                  return (

                    <div
                      key={
                        transaction?._id ||
                        transaction?.reference ||
                        index
                      }
                      className="bg-black/40 border border-gray-800 rounded-2xl p-4"
                    >

                      <div className="flex items-start gap-3">

                        <div
                          className={`p-2 rounded-xl ${
                            positive
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >

                          {getTransactionIcon(
                            transaction
                          )}

                        </div>


                        <div className="flex-1 min-w-0">

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <h3 className="font-bold">
                                {getTransactionTitle(
                                  transaction
                                )}
                              </h3>

                              <p className="text-xs text-gray-500 mt-1">
                                {formatTransactionDate(
                                  transaction?.createdAt
                                )}
                              </p>

                            </div>


                            <div className="text-right shrink-0">

                              {points !== 0 && (

                                <p
                                  className={`font-bold ${
                                    positive
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }`}
                                >

                                  {positive
                                    ? "+"
                                    : ""}

                                  {points.toLocaleString()}
                                  {" "}
                                  {Math.abs(points) === 1
                                    ? "point"
                                    : "points"}

                                </p>

                              )}

                              {conversion &&
                                amount > 0 && (

                                <p className="text-green-400 text-sm mt-1">
                                  +₦
                                  {amount.toLocaleString()}
                                </p>

                              )}

                            </div>

                          </div>


                          <p className="text-sm text-gray-400 mt-2">
                            {getTransactionDescription(
                              transaction
                            )}
                          </p>


                          {transaction?.paymentMethod && (

                            <p className="text-xs text-gray-600 mt-2 capitalize">

                              Method:{" "}
                              {String(
                                transaction.paymentMethod
                              ).replace(
                                /_/g,
                                " "
                              )}

                            </p>

                          )}

                        </div>

                      </div>

                    </div>

                  );
                }
              )}


              {/* ================= LOAD MORE ================= */}

              {transactionPagination &&
                transactionPage <
                  transactionPagination.totalPages && (

                <button
                  onClick={
                    loadMoreTransactions
                  }
                  disabled={
                    loadingMore
                  }
                  className="w-full mt-4 bg-gray-800 hover:bg-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >

                  {loadingMore ? (

                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Loading...

                    </>

                  ) : (

                    "Load More Transactions"

                  )}

                </button>

              )}


              {/* ================= TRANSACTION COUNT ================= */}

              {transactionPagination && (

                <p className="text-center text-xs text-gray-600 mt-3">

                  Showing{" "}
                  {transactions.length.toLocaleString()}
                  {" "}
                  of{" "}
                  {transactionPagination.total.toLocaleString()}
                  {" "}
                  transactions

                </p>

              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
};


/* ================= STAT CARD ================= */

const StatCard = ({
  title,
  value,
  icon,
}) => {

  return (
    <div className="bg-gray-900 rounded-2xl p-4">

      <div className="flex items-center justify-between">

        <div className="text-gray-400">
          {icon}
        </div>

        <p className="text-xs text-gray-500">
          Points
        </p>

      </div>

      <h2 className="text-2xl font-bold mt-4">
        {Number(
          value || 0
        ).toLocaleString()}
      </h2>

      <p className="text-sm text-gray-400 mt-1">
        {title}
      </p>

    </div>
  );
};


export default WalletPage;
