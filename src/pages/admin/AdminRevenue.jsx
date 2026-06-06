import React, { useEffect, useState } from "react";
import { API_BASE } from "../../api/api";

import {
  DollarSign,
  TrendingUp,
  Users,
  RefreshCcw,
  Wallet,
  Loader2,
} from "lucide-react";

const AdminRevenue = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRevenue = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/admin/revenue`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to load revenue");
      }

      setData(json);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>

        <button
          onClick={fetchRevenue}
          className="bg-green-500 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <RefreshCcw size={16} />
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        No data available
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign />
          Revenue Dashboard
        </h1>

        <button
          onClick={fetchRevenue}
          className="bg-gray-800 p-2 rounded-full"
        >
          <RefreshCcw size={18} />
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-2 gap-4">

        <Card
          title="Total Campaign Spend"
          value={`₦${data.totalCampaignSpend?.toLocaleString() || 0}`}
          icon={<Wallet />}
        />

        <Card
          title="Creator Payouts"
          value={`₦${data.totalCreatorPayouts?.toLocaleString() || 0}`}
          icon={<Users />}
        />

        <Card
          title="Pending Earnings"
          value={`₦${data.totalPendingEarnings?.toLocaleString() || 0}`}
          icon={<Loader2 />}
        />

        <Card
          title="AfricSocial Revenue"
          value={`₦${data.africSocialRevenue?.toLocaleString() || 0}`}
          icon={<TrendingUp />}
        />

        <Card
          title="Active Campaigns"
          value={data.activeCampaigns || 0}
          icon={<DollarSign />}
        />
      </div>
    </div>
  );
};

/* ================= CARD COMPONENT ================= */

const Card = ({ title, value, icon }) => {
  return (
    <div className="bg-gray-900 rounded-2xl p-4 shadow-md">
      <div className="flex items-center justify-between text-gray-400">
        {icon}
      </div>

      <h2 className="text-xl font-bold mt-3">{value}</h2>

      <p className="text-sm text-gray-400 mt-1">{title}</p>
    </div>
  );
};

export default AdminRevenue;