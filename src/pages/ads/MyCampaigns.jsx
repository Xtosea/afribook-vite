import React, { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { fetchWithToken } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusClasses = (status) => {
  switch (status) {
    case "active":
      return "bg-green-500/15 text-green-400 border-green-500/30";

    case "pending_payment":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";

    case "completed":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";

    case "cancelled":
      return "bg-red-500/15 text-red-400 border-red-500/30";

    default:
      return "bg-gray-500/15 text-gray-300 border-gray-500/30";
  }
};

const MyCampaigns = () => {
  const { token } = useAuth();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchCampaigns = async ({ silent = false } = {}) => {
    if (!token) {
      setCampaigns([]);
      setLoading(false);
      return;
    }

    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const result = await fetchWithToken(
        "/api/ads/campaigns",
        token
      );

      setCampaigns(
        Array.isArray(result?.campaigns)
          ? result.campaigns
          : []
      );
    } catch (err) {
      console.error("MY CAMPAIGNS ERROR:", err);
      setError(
        err?.message ||
          "Unable to load your advertising campaigns."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-gray-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading campaigns...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              My Campaigns
            </h1>

            <p className="text-gray-400 text-sm mt-1">
              Manage your AfricSocial advertising campaigns.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchCampaigns({ silent: true })}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 transition"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {campaigns.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">
              No campaigns yet
            </h2>

            <p className="text-gray-400">
              Your advertising campaigns will appear here after
              you create one.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-4 md:p-5"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg md:text-xl font-bold break-words">
                      {campaign.title}
                    </h2>

                    {campaign.description && (
                      <p className="text-gray-400 text-sm mt-1 whitespace-pre-wrap break-words">
                        {campaign.description}
                      </p>
                    )}
                  </div>

                  <span
                    className={`inline-flex self-start items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                      campaign.status
                    )}`}
                  >
                    {String(campaign.status || "unknown").replace(
                      /_/g,
                      " "
                    )}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-lg bg-black/40 p-3">
                    <p className="text-xs text-gray-500">
                      Campaign Package
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {campaign.productName || campaign.productId || "—"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-black/40 p-3">
                    <p className="text-xs text-gray-500">
                      Amount
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {formatCurrency(campaign.amount)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-black/40 p-3">
                    <p className="text-xs text-gray-500">
                      Duration
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {campaign.durationDays
                        ? `${campaign.durationDays} days`
                        : "—"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-black/40 p-3">
                    <p className="text-xs text-gray-500">
                      Payment
                    </p>
                    <p className="text-sm font-medium mt-1 capitalize">
                      {String(
                        campaign.paymentStatus || "unpaid"
                      ).replace(/_/g, " ")}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-lg bg-black/40 p-3">
                    <p className="text-xs text-gray-500">
                      Impressions
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {Number(campaign.impressions || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-black/40 p-3">
                    <p className="text-xs text-gray-500">
                      Clicks
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {Number(campaign.clicks || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-black/40 p-3">
                    <p className="text-xs text-gray-500">
                      Views
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {Number(campaign.views || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg bg-black/40 p-3">
                    <p className="text-xs text-gray-500">
                      Created
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {formatDate(campaign.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">
                      Start date:
                    </span>{" "}
                    <span className="text-gray-300">
                      {formatDate(campaign.startDate)}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">
                      End date:
                    </span>{" "}
                    <span className="text-gray-300">
                      {formatDate(campaign.endDate)}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">
                      Target:
                    </span>{" "}
                    <span className="text-gray-300">
                      {campaign.target?.gender || "all"}
                      {campaign.target?.ageMin &&
                      campaign.target?.ageMax
                        ? `, ${campaign.target.ageMin}-${campaign.target.ageMax}`
                        : ""}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">
                      Location:
                    </span>{" "}
                    <span className="text-gray-300">
                      {[
                        campaign.target?.city,
                        campaign.target?.state,
                        campaign.target?.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || "All locations"}
                    </span>
                  </div>
                </div>

                {campaign.paymentStatus === "paid" &&
                  campaign.paymentReference && (
                    <div className="mt-4 text-xs text-gray-500 break-all">
                      Payment reference:{" "}
                      {campaign.paymentReference}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCampaigns;