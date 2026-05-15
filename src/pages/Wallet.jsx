import React, { useEffect, useState } from "react";
import { API_BASE } from "../api/api";

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWallet = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_BASE}/api/wallet`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setWallet(data);
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const convert = async () => {
    setLoading(true);

    const token = localStorage.getItem("token");

    await fetch(
      `${API_BASE}/api/wallet/convert`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await fetchWallet();
    setLoading(false);
  };

  if (!wallet) return <div>Loading...</div>;

  return (
    <div className="p-4 text-white">

      <h1 className="text-2xl font-bold mb-4">
        Wallet
      </h1>

      <div className="bg-gray-900 p-4 rounded mb-4">
        <p>Points: {wallet.points}</p>
        <p>Balance: ₦{wallet.balance}</p>
        <p>Total Earned: ₦{wallet.lifetimeEarned}</p>
      </div>

      <button
        onClick={convert}
        disabled={loading}
        className="bg-green-500 px-4 py-2 rounded"
      >
        Convert Points
      </button>

    </div>
  );
};

export default Wallet;