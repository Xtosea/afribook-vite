import React, { useEffect, useState } from "react";
import { API_BASE } from "../../api/api";

import {
  CheckCircle,
  XCircle,
  RefreshCcw,
  DollarSign,
  Loader2,
} from "lucide-react";

const AdminEarnings = () => {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");

  /* ================= FETCH EARNINGS ================= */

  const fetchEarnings = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/admin/earnings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load earnings");
      }

      setEarnings(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  /* ================= APPROVE ================= */

  const approveEarning = async (id) => {
    try {
      setProcessingId(id);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/admin/earnings/${id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Approval failed");
      }

      alert("Earning approved & wallet credited");

      fetchEarnings();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  /* ================= REJECT ================= */

  const rejectEarning = async (id) => {
    try {
      setProcessingId(id);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/admin/earnings/${id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Rejection failed");
      }

      alert("Earning rejected");

      fetchEarnings();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign />
          Creator Earnings (Admin)
        </h1>

        <button
          onClick={fetchEarnings}
          className="bg-gray-800 p-2 rounded-full"
        >
          <RefreshCcw size={18} />
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="text-red-400 mb-4">{error}</div>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {earnings.length === 0 ? (
          <p className="text-gray-400">No earnings found</p>
        ) : (
          earnings.map((e) => (
            <div
              key={e._id}
              className="bg-gray-900 p-4 rounded-xl flex flex-col gap-2"
            >
              {/* TOP INFO */}
              <div className="flex justify-between">
                <div>
                  <p className="font-bold">
                    {e.creator?.name || "User"}
                  </p>

                  <p className="text-xs text-gray-400">
                    Campaign: {e.campaign?.title || "N/A"}
                  </p>
                </div>

                <div className="text-green-400 font-bold">
                  ₦{e.amount?.toLocaleString()}
                </div>
              </div>

              {/* STATUS */}
              <p className="text-sm text-gray-400">
                Status:{" "}
                <span className="capitalize text-white">
                  {e.status}
                </span>
              </p>

              {/* ACTIONS */}
              {e.status === "pending" && (
                <div className="flex gap-2 mt-2">
                  <button
                    disabled={processingId === e._id}
                    onClick={() => approveEarning(e._id)}
                    className="flex items-center gap-1 bg-green-600 px-3 py-1 rounded-lg"
                  >
                    <CheckCircle size={16} />
                    {processingId === e._id
                      ? "Processing..."
                      : "Approve"}
                  </button>

                  <button
                    disabled={processingId === e._id}
                    onClick={() => rejectEarning(e._id)}
                    className="flex items-center gap-1 bg-red-600 px-3 py-1 rounded-lg"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminEarnings;