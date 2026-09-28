import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  FileText,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

import { API_BASE } from "../../api/api";

export default function AdminKyc() {
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const loadPendingKyc = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/admin/kyc/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to load KYC applications"
        );
      }

      setKycs(Array.isArray(data) ? data : data?.kycs || []);
    } catch (err) {
      console.error("Admin KYC load error:", err);
      setError(err.message || "Failed to load KYC applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingKyc();
  }, []);

  const handleApprove = async (kyc) => {
    const userId = kyc.user;

    if (!userId) return;

    const confirmed = window.confirm(
      `Approve KYC for ${kyc.fullName || "this seller"}?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(kyc._id);

      const response = await fetch(
        `${API_BASE}/api/admin/kyc/${userId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to approve KYC"
        );
      }

      setKycs((current) =>
        current.filter((item) => item._id !== kyc._id)
      );
    } catch (err) {
      console.error("Approve KYC error:", err);
      window.alert(err.message || "Failed to approve KYC");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (kyc) => {
    const userId = kyc.user;

    if (!userId) return;

    const reason = window.prompt(
      "Enter the reason for rejecting this KYC application:"
    );

    if (reason === null) return;

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      window.alert("A rejection reason is required.");
      return;
    }

    try {
      setProcessingId(kyc._id);

      const response = await fetch(
        `${API_BASE}/api/admin/kyc/${userId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reason: trimmedReason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to reject KYC"
        );
      }

      setKycs((current) =>
        current.filter((item) => item._id !== kyc._id)
      );
    } catch (err) {
      console.error("Reject KYC error:", err);
      window.alert(err.message || "Failed to reject KYC");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-green-400" size={28} />
              <h1 className="text-2xl font-bold">
                Seller KYC Review
              </h1>
            </div>

            <p className="text-gray-400 text-sm mt-1">
              Review marketplace seller identity verification applications.
            </p>
          </div>

          <button
            onClick={loadPendingKyc}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 disabled:opacity-50"
          >
            <RefreshCcw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mr-2" size={20} />
            Loading KYC applications...
          </div>
        ) : kycs.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-800">
            <CheckCircle
              size={42}
              className="mx-auto mb-3 text-green-400"
            />

            <h2 className="text-lg font-semibold">
              No pending KYC applications
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              New seller verification applications will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {kycs.map((kyc) => {
              const processing = processingId === kyc._id;

              return (
                <div
                  key={kyc._id}
                  className="bg-gray-900 rounded-2xl border border-gray-800 p-4 sm:p-5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-full bg-gray-800 flex items-center justify-center">
                          <User size={21} className="text-gray-300" />
                        </div>

                        <div>
                          <h2 className="font-semibold text-lg">
                            {kyc.fullName || "Unknown seller"}
                          </h2>

                          <p className="text-gray-400 text-sm">
                            ID Type: {kyc.idType || "Not specified"}
                          </p>

                          <p className="text-gray-500 text-xs mt-1">
                            Submitted:{" "}
                            {kyc.submittedAt
                              ? new Date(
                                  kyc.submittedAt
                                ).toLocaleString()
                              : "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                        <div className="rounded-xl bg-black/40 border border-gray-800 p-4">
                          <div className="flex items-center gap-2 text-gray-300 mb-2">
                            <FileText size={18} />
                            <span className="font-medium">
                              Government ID
                            </span>
                          </div>

                          <p className="text-xs text-gray-500">
                            Securely stored document
                          </p>
                        </div>

                        <div className="rounded-xl bg-black/40 border border-gray-800 p-4">
                          <div className="flex items-center gap-2 text-gray-300 mb-2">
                            <User size={18} />
                            <span className="font-medium">
                              Selfie
                            </span>
                          </div>

                          <p className="text-xs text-gray-500">
                            Securely stored selfie
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:min-w-[150px]">
                      <button
                        onClick={() => handleApprove(kyc)}
                        disabled={processing}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 font-medium"
                      >
                        {processing ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <CheckCircle size={17} />
                        )}
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(kyc)}
                        disabled={processing}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 font-medium"
                      >
                        <XCircle size={17} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
