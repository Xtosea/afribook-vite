import React, { useEffect, useState } from "react";
import {
  RefreshCcw,
  CheckCircle,
  XCircle,
  Rocket,
  Loader2,
} from "lucide-react";
import { API_BASE } from "../../api/api";

const AdminBoosts = () => {
  const [boosts, setBoosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchBoosts = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${API_BASE}/api/admin/boosts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(
          data?.error ||
          "Failed to load pending Boosts."
        );
      }

      setBoosts(
        Array.isArray(data?.boosts)
          ? data.boosts
          : []
      );
    } catch (err) {
      console.error(
        "ADMIN BOOSTS API ERROR:",
        err
      );

      setError(
        err?.message ||
        "Failed to load pending Boosts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoosts();
  }, []);

  const approveBoost = async (id) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Approve this Boost?"
    );

    if (!confirmed) return;

    try {
      setActionId(id);
      setError("");

      const res = await fetch(
        `${API_BASE}/api/admin/boosts/${id}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(
          data?.error ||
          "Failed to approve Boost."
        );
      }

      await fetchBoosts();
    } catch (err) {
      console.error(
        "APPROVE BOOST API ERROR:",
        err
      );

      setError(
        err?.message ||
        "Failed to approve Boost."
      );
    } finally {
      setActionId(null);
    }
  };

  const rejectBoost = async (id) => {
    if (!id) return;

    const reason = window.prompt(
      "Enter the reason for rejecting this Boost:"
    );

    if (reason === null) return;

    const trimmedReason =
      reason.trim();

    if (!trimmedReason) {
      window.alert(
        "A rejection reason is required."
      );
      return;
    }

    try {
      setActionId(id);
      setError("");

      const res = await fetch(
        `${API_BASE}/api/admin/boosts/${id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            reason: trimmedReason,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(
          data?.error ||
          "Failed to reject Boost."
        );
      }

      await fetchBoosts();
    } catch (err) {
      console.error(
        "REJECT BOOST API ERROR:",
        err
      );

      setError(
        err?.message ||
        "Failed to reject Boost."
      );
    } finally {
      setActionId(null);
    }
  };

  const formatPrice = (
    amount,
    currency = "NGN"
  ) => {
    try {
      return new Intl.NumberFormat(
        "en-NG",
        {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        }
      ).format(amount || 0);
    } catch {
      return `${currency} ${amount || 0}`;
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";

    try {
      return new Date(value).toLocaleString();
    } catch {
      return "—";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2
            className="animate-spin"
            size={24}
          />
          Loading Boost approvals...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Rocket size={24} />
            <h1 className="text-2xl font-bold">
              Boost Approvals
            </h1>
          </div>

          <p className="text-sm text-gray-400 mt-1">
            Review paid Boost requests before
            they become active.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBoosts}
          className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800"
          title="Refresh"
        >
          <RefreshCcw size={20} />
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-300">
          {error}
        </div>
      )}

      {boosts.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-8 text-center text-gray-400">
          No pending Boost approvals.
        </div>
      ) : (
        <div className="space-y-5">
          {boosts.map((boost) => (
            <div
              key={boost.id}
              className="bg-gray-900 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Rocket
                      size={20}
                    />
                    <h2 className="font-bold">
                      {boost.productId}
                    </h2>
                  </div>

                  <p className="text-sm text-gray-400 mt-2">
                    Creator:{" "}
                    <span className="text-white">
                      {boost.user?.name ||
                        "Unknown user"}
                    </span>
                  </p>

                  {boost.user?.email && (
                    <p className="text-sm text-gray-500">
                      {boost.user.email}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold">
                    {formatPrice(
                      boost.amount,
                      boost.currency
                    )}
                  </p>

                  <p className="text-xs text-yellow-400">
                    Pending approval
                  </p>
                </div>
              </div>

              {boost.post && (
                <div className="mt-4 rounded-xl bg-black/40 p-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <span>
                      {boost.post.isReel
                        ? "Reel"
                        : "Post"}
                    </span>

                    {boost.post.isSharedPost && (
                      <span className="text-red-400">
                        Shared
                      </span>
                    )}
                  </div>

                  {boost.post.content && (
                    <p className="text-sm text-gray-200 whitespace-pre-wrap">
                      {boost.post.content}
                    </p>
                  )}

                  {Array.isArray(
                    boost.post.media
                  ) &&
                    boost.post.media.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                        {boost.post.media.map(
                          (media, index) => {
                            const src =
                              typeof media ===
                              "string"
                                ? media
                                : media?.url ||
                                  media?.secure_url ||
                                  media?.src ||
                                  "";

                            if (!src) {
                              return null;
                            }

                            const isVideo =
                              typeof media ===
                                "object" &&
                              (
                                media?.type ===
                                  "video" ||
                                media?.resource_type ===
                                  "video"
                              );

                            return isVideo ? (
                              <video
                                key={`${boost.id}-${index}`}
                                src={src}
                                controls
                                className="w-full h-32 object-cover rounded-lg bg-black"
                              />
                            ) : (
                              <img
                                key={`${boost.id}-${index}`}
                                src={src}
                                alt={`Boost media ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg bg-black"
                              />
                            );
                          }
                        )}
                      </div>
                    )}
                </div>
              )}

              {boost.listing && (
                <div className="mt-4 rounded-xl bg-black/40 p-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <span>Marketplace Listing</span>
                  </div>

                  {boost.listing.title && (
                    <h3 className="text-base font-semibold text-white">
                      {boost.listing.title}
                    </h3>
                  )}

                  <p className="text-sm text-gray-200 mt-1">
                    {formatPrice(
                      boost.listing.price,
                      boost.listing.currency || "NGN"
                    )}
                  </p>

                  {boost.listing.description && (
                    <p className="text-sm text-gray-300 mt-2 whitespace-pre-wrap">
                      {boost.listing.description}
                    </p>
                  )}

                  {Array.isArray(boost.listing.images) &&
                    boost.listing.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                        {boost.listing.images.slice(0, 4).map(
                          (image, index) => {
                            const src =
                              typeof image === "string"
                                ? image
                                : image?.url ||
                                  image?.secure_url ||
                                  image?.src ||
                                  "";

                            if (!src) return null;

                            return (
                              <img
                                key={`${boost.id}-listing-${index}`}
                                src={src}
                                alt={`Listing image ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg bg-black"
                              />
                            );
                          }
                        )}
                      </div>
                    )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 text-xs text-gray-500">
                <p>
                  Payment reference:{" "}
                  <span className="text-gray-300 break-all">
                    {boost.transactionReference ||
                      "—"}
                  </span>
                </p>

                <p>
                  Submitted:{" "}
                  <span className="text-gray-300">
                    {formatDate(
                      boost.createdAt
                    )}
                  </span>
                </p>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() =>
                    approveBoost(boost.id)
                  }
                  disabled={
                    actionId === boost.id
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  {actionId === boost.id ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <CheckCircle
                      size={18}
                    />
                  )}
                  Approve
                </button>

                <button
                  type="button"
                  onClick={() =>
                    rejectBoost(boost.id)
                  }
                  disabled={
                    actionId === boost.id
                  }
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  {actionId === boost.id ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <XCircle
                      size={18}
                    />
                  )}
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBoosts;
