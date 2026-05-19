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
    <div className="bg-gray-900 p-4 rounded mb-4 space-y-2">

  <p>
    Total Points: {wallet.points}
  </p>

  <p>
    Balance: ₦{wallet.balance}
  </p>

  <p>
    Lifetime Earned:
    ₦{wallet.lifetimeEarned}
  </p>

  <hr />

  <p>
    Story Likes:
    {wallet.storyLikes}
  </p>

  <p>
    Story Views:
    {wallet.storyViews}
  </p>

  <p>
    Reel Likes:
    {wallet.reelLikes}
  </p>

  <p>
    Reel Views:
    {wallet.reelViews}
  </p>

  <p>
    Video Likes:
    {wallet.videoLikes}
  </p>

  <p>
    Video Views:
    {wallet.videoViews}
  </p>

  <p>
    Referral Points:
    {wallet.referralPoints}
  </p>

  <p>
    Leaderboard Points:
    {wallet.leaderboardPoints}
  </p>

</div>
  );
};

export default Wallet;