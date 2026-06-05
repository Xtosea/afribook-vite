import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Users,
  BadgeCheck,
  Megaphone,
  Wallet,
  AlertTriangle,
  BarChart3,
  Shield,
} from "lucide-react";

import { API_BASE }
from "../../api/api";

const AdminDashboard = () => {

  const [stats, setStats] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const token =
    localStorage.getItem("token");

  useEffect(() => {

    fetch(
      `${API_BASE}/api/admin/stats`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    )
      .then(res => res.json())
      .then(data => {
        setStats(data);
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  if (loading) {
    return (
      <div className="text-white p-6">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">

      <h1 className="text-3xl font-bold mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-8">

        <StatCard
          icon={<Users />}
          title="Users"
          value={stats?.users || 0}
        />

        <StatCard
          icon={<BadgeCheck />}
          title="Creators"
          value={stats?.creators || 0}
        />

        <StatCard
          icon={<Megaphone />}
          title="Advertisers"
          value={stats?.advertisers || 0}
        />

        <StatCard
          icon={<BarChart3 />}
          title="Campaigns"
          value={stats?.campaigns || 0}
        />

        <StatCard
          icon={<Wallet />}
          title="Withdrawals"
          value={
            stats?.pendingWithdrawals || 0
          }
        />

      </div>

      <div className="grid grid-cols-2 gap-4">

        <AdminLink
          to="/admin/verifications"
          label="Verifications"
        />

        <AdminLink
          to="/admin/withdrawals"
          label="Withdrawals"
        />

        <AdminLink
          to="/admin/creators"
          label="Creators"
        />

        <AdminLink
          to="/admin/advertisers"
          label="Advertisers"
        />

        <AdminLink
          to="/admin/campaigns"
          label="Campaigns"
        />

        <AdminLink
          to="/admin/fraud"
          label="Fraud Detection"
        />

      </div>

    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon,
}) => (
  <div className="bg-gray-900 rounded-2xl p-4">

    <div className="flex justify-between">

      {icon}

      <span>
        {value}
      </span>

    </div>

    <p className="mt-3 text-gray-400">
      {title}
    </p>

  </div>
);

const AdminLink = ({
  to,
  label,
}) => (
  <Link
    to={to}
    className="bg-gray-900 rounded-xl p-4 text-center hover:bg-gray-800"
  >
    {label}
  </Link>
);

export default AdminDashboard;