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

  /* ================= FETCH WALLET ================= */

  const fetchWallet = async () => {

    try {

      setLoading(true);

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

  useEffect(() => {
    fetchWallet();
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
        `₦${data.earned} added to your balance`
      );

      fetchWallet();

    } catch (err) {

      console.error(err);

    } finally {

      setConverting(false);
    }
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

      {/* HEADER */}

      <div className="sticky top-0 z-20 bg-black/90 backdrop-blur border-b border-gray-800 px-4 py-4 flex items-center justify-between">

        <h1 className="text-2xl font-bold flex items-center gap-2">

          <Wallet size={28} />

          Wallet

        </h1>

        <button
          onClick={fetchWallet}
          className="bg-gray-800 p-2 rounded-full"
        >
          <RefreshCcw size={18} />
        </button>

      </div>

      <div className="p-4 space-y-5">

        {/* BALANCE CARD */}

        <div className="bg-gradient-to-r from-green-500 to-emerald-700 rounded-3xl p-6 shadow-xl">

          <p className="text-sm opacity-80">
            Available Balance
          </p>

          <h2 className="text-4xl font-bold mt-2">
            ₦
            {wallet?.balance?.toLocaleString() || 0}
          </h2>

          <div className="mt-5 flex items-center justify-between">

            <div>

              <p className="text-sm opacity-80">
                Total Points
              </p>

              <h3 className="text-2xl font-bold">
                {wallet?.points?.toLocaleString() || 0}
              </h3>

            </div>

            <Coins size={45} />

          </div>

          {/* ================= CONVERSION & WITHDRAWAL INFO ================= */}

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

          <button
            onClick={convertPoints}
            disabled={
              converting ||
              !wallet?.points ||
              (!isAdmin &&
                wallet.points < 10000)
            }
            className={`mt-4 w-full py-3 rounded-2xl font-bold transition ${
              wallet?.points > 0 &&
              (isAdmin || wallet.points >= 10000)
                ? "bg-black text-white"
                : "bg-gray-400 text-gray-700"
            }`}
          >

            {converting
              ? "Converting..."
              : wallet?.points > 0 &&
                (isAdmin || wallet.points >= 10000)
              ? "Convert to Cash"
              : "Get 10,000 Points to Convert"}

          </button>

          <p className="text-xs text-center opacity-60 mt-2">
            1 point = ₦0.50
          </p>
        </div>

        {/* STATS GRID */}

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

        {/* EXTRA */}

        <div className="bg-gray-900 rounded-3xl p-5 space-y-4">

          <div className="flex items-center justify-between">

            <span className="text-gray-400">
              Lifetime Earned
            </span>

            <span className="font-bold text-green-400">
              ₦
              {wallet?.lifetimeEarned?.toLocaleString() || 0}
            </span>

          </div>

          <div className="flex items-center justify-between">

            <span className="text-gray-400">
              Pending
            </span>

            <span className="font-bold text-yellow-400">
              ₦
              {wallet?.pending?.toLocaleString() || 0}
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
        {value || 0}
      </h2>

      <p className="text-sm text-gray-400 mt-1">
        {title}
      </p>

    </div>
  );
};

export default WalletPage;