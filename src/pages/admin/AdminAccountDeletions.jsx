import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { API_BASE, fetchWithToken } from "../../api/api";

const STATUS_OPTIONS = [
  "all",
  "pending",
  "processing",
  "review_required",
  "completed",
  "cancelled",
];

const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  review_required: "Financial review",
  completed: "Completed",
  cancelled: "Cancelled",
  unknown: "Unknown",
};

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-500/15 text-amber-300",
    processing: "bg-blue-500/15 text-blue-300",
    review_required: "bg-orange-500/15 text-orange-300",
    completed: "bg-green-500/15 text-green-300",
    cancelled: "bg-gray-700 text-gray-300",
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-700 text-gray-300"
      }`}
    >
      {STATUS_LABELS[status] || status || STATUS_LABELS.unknown}
    </span>
  );
}

function SummaryCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        </div>
        <Icon size={25} className="text-blue-400" aria-hidden="true" />
      </div>
      <p className="mt-2 text-xs text-gray-500">{description}</p>
    </div>
  );
}

export default function AdminAccountDeletions() {
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0,
  });
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewByRequest, setPreviewByRequest] = useState({});
  const [previewLoadingId, setPreviewLoadingId] = useState("");
  const [previewErrorByRequest, setPreviewErrorByRequest] = useState({});


  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const query = new URLSearchParams({
        page: String(page),
        limit: "25",
      });

      if (status !== "all") {
        query.set("status", status);
      }

      const result = await fetchWithToken(
        `${API_BASE}/api/admin/account-deletions?${query.toString()}`,
        token,
        { retryNetworkErrors: false }
      );

      if (!result?.success) {
        throw new Error(
          result?.message || "Unable to load account-deletion requests."
        );
      }

      setRequests(Array.isArray(result.requests) ? result.requests : []);
      setCounts(result.counts || {});
      setPagination(
        result.pagination || {
          page,
          limit: 25,
          total: 0,
          pages: 0,
        }
      );
    } catch (err) {
      setError(
        err?.message || "Unable to load account-deletion requests."
      );
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  function changeStatus(value) {
    setStatus(value);
    setPage(1);
  }

    const loadDeletionPreview = useCallback(async (requestId) => {
    if (!requestId || previewLoadingId) return;

    setPreviewLoadingId(requestId);
    setPreviewErrorByRequest((current) => ({
      ...current,
      [requestId]: "",
    }));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const query = new URLSearchParams({
        requestId: String(requestId),
      });

      const result = await fetchWithToken(
        `${API_BASE}/api/admin/account-deletions/preview?${query.toString()}`,
        token,
        { retryNetworkErrors: false }
      );

      if (!result?.success || result?.dryRun !== true) {
        throw new Error(
          result?.message || "A verified read-only preview was not returned."
        );
      }

      setPreviewByRequest((current) => ({
        ...current,
        [requestId]: result,
      }));
    } catch (err) {
      setPreviewErrorByRequest((current) => ({
        ...current,
        [requestId]: err?.message || "Unable to load preview.",
      }));
    } finally {
      setPreviewLoadingId("");
    }
  }, [previewLoadingId]);

const totalRequests = Object.values(counts).reduce(
    (total, value) =>
      total + (Number.isFinite(Number(value)) ? Number(value) : 0),
    0
  );

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/admindashboard"
          className="mb-5 inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Back to Admin Dashboard
        </Link>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Account Deletions
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Review account-deletion requests and their current status.
            </p>
          </div>

          <button
            type="button"
            onClick={loadRequests}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>

        <section
          className="mb-6 rounded-xl border border-amber-700/50 bg-amber-950/30 p-4"
          aria-label="Deletion system status"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 shrink-0 text-amber-400"
              size={22}
              aria-hidden="true"
            />
            <div>
              <h2 className="font-semibold text-amber-200">
                Read-only monitoring — automatic cleanup is not activated
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                This page displays request records only. It does not delete
                accounts or files, change request statuses, resolve wallet
                balances, or send notification emails. A request appearing
                here as eligible for review is not authorisation to delete
                data.
              </p>
            </div>
          </div>
        </section>

        <section
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Deletion request totals"
        >
          <SummaryCard
            title="All requests"
            value={totalRequests}
            icon={ShieldCheck}
            description="Requests across recorded statuses"
          />
          <SummaryCard
            title="Pending"
            value={counts.pending || 0}
            icon={Clock3}
            description="Requests awaiting further processing"
          />
          <SummaryCard
            title="Financial review"
            value={counts.review_required || 0}
            icon={AlertTriangle}
            description="Requests requiring review"
          />
          <SummaryCard
            title="Completed"
            value={counts.completed || 0}
            icon={CheckCircle2}
            description="Requests marked completed"
          />
        </section>

        <section className="rounded-xl border border-gray-800 bg-gray-950 p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Deletion requests</h2>
              <p className="mt-1 text-sm text-gray-400">
                {pagination.total || 0} matching request(s)
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-300">
              Status
              <select
                value={status}
                onChange={(event) => changeStatus(event.target.value)}
                className="max-w-[210px] rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === "all"
                      ? "All statuses"
                      : STATUS_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-800 bg-red-950/30 p-4 text-sm text-red-200"
            >
              <p>{error}</p>
              <p className="mt-2 text-xs text-red-300">
                If this continues, verify that the development API is
                available and that your signed-in account has administrator
                permissions.
              </p>
            </div>
          )}

          {loading ? (
            <div
              className="py-12 text-center text-gray-400"
              role="status"
            >
              Loading account-deletion requests…
            </div>
          ) : !error && requests.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <XCircle className="mx-auto mb-3" size={30} aria-hidden="true" />
              <p>No requests were found for this filter.</p>
            </div>
          ) : !error ? (
            <>
              <div className="space-y-4">
                {requests.map((record) => (
                  <article
                    key={record.id}
                    className="rounded-lg border border-gray-800 bg-gray-900/70 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500">
                          Request reference
                        </p>
                        <p className="mt-1 break-all font-mono text-sm text-gray-200">
                          {record.id}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={record.status} />
                    <button
                      type="button"
                      onClick={() => loadDeletionPreview(record.id)}
                      disabled={Boolean(previewLoadingId)}
                      className="rounded-lg border border-blue-700 px-3 py-2 text-sm text-blue-200 disabled:opacity-50"
                    >
                      {previewLoadingId === record.id
                        ? "Checking…"
                        : previewByRequest[record.id]
                          ? "Refresh preview"
                          : "Preview deletion"}
                    </button>
                  </div>
                    </div>

                    <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <div>
                        <dt className="text-xs text-gray-500">
                          Request received
                        </dt>
                        <dd className="mt-1 text-sm text-gray-200">
                          {formatDate(record.requestedAt)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs text-gray-500">
                          30-day grace deadline
                        </dt>
                        <dd className="mt-1 text-sm text-gray-200">
                          {formatDate(record.graceDeadline)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs text-gray-500">
                          Financial review
                        </dt>
                        <dd className="mt-1 text-sm text-gray-200">
                          {record.financialReviewRequired
                            ? "Required"
                            : "Not flagged"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs text-gray-500">
                          Last updated
                        </dt>
                        <dd className="mt-1 text-sm text-gray-200">
                          {formatDate(record.updatedAt)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs text-gray-500">
                          Completed
                        </dt>
                        <dd className="mt-1 text-sm text-gray-200">
                          {formatDate(record.completedAt)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs text-gray-500">
                          Cancelled
                        </dt>
                        <dd className="mt-1 text-sm text-gray-200">
                          {formatDate(record.cancelledAt)}
                        </dd>
                      </div>
                    </dl>

                    {/*
                                          Read-only preview: this panel never performs deletion.
                                        */}
                                        {previewErrorByRequest[record.id] && (
                                          <p className="mt-4 rounded-lg border border-red-800/60 bg-red-950/20 p-3 text-sm text-red-200">
                                            Preview error: {previewErrorByRequest[record.id]}
                                          </p>
                                        )}

                                        {previewByRequest[record.id] && (() => {
                                          const preview = previewByRequest[record.id];
                                          const request = preview.request || {};
                                          const finance = preview.financialReview || {};
                                          const counts = preview.recordCounts || {};
                                          const checks = preview.checks || {};
                                          const blockers = Array.isArray(preview.blockers)
                                            ? preview.blockers
                                            : [];

                                          const displayValue = (value) =>
                                            value === null || value === undefined
                                              ? "Unavailable"
                                              : String(value);

                                          return (
                                            <section className="mt-4 rounded-xl border border-blue-800/70 bg-blue-950/20 p-4">
                                              <h4 className="font-semibold text-blue-200">
                                                Read-only deletion preview
                                              </h4>

                                              <p className="mt-2 text-sm text-gray-300">
                                                This is a dry run. It does not delete data, modify
                                                the account, or authorise deletion.
                                              </p>

                                              <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                <div>
                                                  <dt className="text-xs text-gray-400">Request status</dt>
                                                  <dd className="mt-1 text-sm text-gray-100">
                                                    {displayValue(request.status)}
                                                  </dd>
                                                </div>
                                                <div>
                                                  <dt className="text-xs text-gray-400">Requested at</dt>
                                                  <dd className="mt-1 text-sm text-gray-100">
                                                    {request.requestedAt
                                                      ? formatDate(request.requestedAt)
                                                      : "Unavailable"}
                                                  </dd>
                                                </div>
                                                <div>
                                                  <dt className="text-xs text-gray-400">Grace deadline</dt>
                                                  <dd className="mt-1 text-sm text-gray-100">
                                                    {request.graceDeadline
                                                      ? formatDate(request.graceDeadline)
                                                      : "Unavailable"}
                                                  </dd>
                                                </div>
                                                <div>
                                                  <dt className="text-xs text-gray-400">Grace period expired</dt>
                                                  <dd className="mt-1 text-sm text-gray-100">
                                                    {displayValue(request.gracePeriodExpired)}
                                                  </dd>
                                                </div>
                                                <div>
                                                  <dt className="text-xs text-gray-400">Financial checks available</dt>
                                                  <dd className="mt-1 text-sm text-gray-100">
                                                    {displayValue(finance.checksAvailable)}
                                                  </dd>
                                                </div>
                                                <div>
                                                  <dt className="text-xs text-gray-400">Wallet record found</dt>
                                                  <dd className="mt-1 text-sm text-gray-100">
                                                    {checks.walletLookupAvailable === true
                                                      ? displayValue(finance.walletRecordFound)
                                                      : "Unavailable"}
                                                  </dd>
                                                </div>
                                                <div>
                                                  <dt className="text-xs text-gray-400">Outstanding wallet value</dt>
                                                  <dd className="mt-1 text-sm text-gray-100">
                                                    {displayValue(finance.walletHasOutstandingValue)}
                                                  </dd>
                                                </div>
                                                <div>
                                                  <dt className="text-xs text-gray-400">Pending payments</dt>
                                                  <dd className="mt-1 text-sm text-gray-100">
                                                    {checks.paymentCheckAvailable === true
                                                      ? displayValue(finance.pendingPayments)
                                                      : "Unavailable"}
                                                  </dd>
                                                </div>
                                                <div>
                                                  <dt className="text-xs text-gray-400">Pending transactions</dt>
                                                  <dd className="mt-1 text-sm text-gray-100">
                                                    {checks.transactionCheckAvailable === true
                                                      ? displayValue(finance.pendingTransactions)
                                                      : "Unavailable"}
                                                  </dd>
                                                </div>
                                                <div>
                                                  <dt className="text-xs text-gray-400">Payout system verified</dt>
                                                  <dd className="mt-1 text-sm text-gray-100">
                                                    {displayValue(finance.payoutSystemVerified)}
                                                  </dd>
                                                </div>
                                              </dl>

                                              <h5 className="mt-5 font-medium text-gray-100">
                                                Records that may need review
                                              </h5>
                                              <dl className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                {[
                                                  ["Posts", "posts", "postsCheckAvailable"],
                                                  ["Stories", "stories", "storiesCheckAvailable"],
                                                  ["Marketplace listings", "marketplaceListings", "marketplaceCheckAvailable"],
                                                  ["Messages involving account", "messagesInvolvingAccount", "messagesCheckAvailable"],
                                                  ["Notifications", "notifications", "notificationsCheckAvailable"],
                                                ].map(([label, key, checkKey]) => (
                                                  <div key={key}>
                                                    <dt className="text-xs text-gray-400">{label}</dt>
                                                    <dd className="mt-1 text-sm text-gray-100">
                                                      {checks[checkKey] === true
                                                        ? displayValue(counts[key])
                                                        : "Unavailable"}
                                                    </dd>
                                                  </div>
                                                ))}
                                              </dl>

                                              <h5 className="mt-5 font-medium text-gray-100">
                                                Blockers and outstanding checks
                                              </h5>

                                              {blockers.length ? (
                                                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-orange-200">
                                                  {blockers.map((blocker, index) => (
                                                    <li key={`${index}-${String(blocker)}`}>
                                                      {typeof blocker === "string"
                                                        ? blocker
                                                        : JSON.stringify(blocker)}
                                                    </li>
                                                  ))}
                                                </ul>
                                              ) : (
                                                <p className="mt-2 text-sm text-gray-300">
                                                  No blockers were returned by this preview. This
                                                  does not authorise deletion.
                                                </p>
                                              )}

                                              <p className="mt-4 rounded-lg border border-orange-800/60 bg-orange-950/20 p-3 text-sm text-orange-200">
                                                Preview only. Account deletion, media cleanup and
                                                financial actions are not performed by this check.
                                              </p>
                                            </section>
                                          );
                                        })()}

                                        
                    {record.financialReviewRequired && (
                      <p className="mt-4 rounded-lg border border-orange-800/60 bg-orange-950/20 p-3 text-sm text-orange-200">
                        Financial review is flagged. Outstanding balances
                        and payouts must be handled under the applicable
                        financial procedures before deletion can proceed.
                      </p>
                    )}
                  </article>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-800 pt-4">
                <p className="text-sm text-gray-400">
                  Page {pagination.page || page} of {pagination.pages || 0}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1 || loading}
                    className="rounded-lg border border-gray-700 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) =>
                        Math.min(pagination.pages || current, current + 1)
                      )
                    }
                    disabled={
                      loading ||
                      !pagination.pages ||
                      page >= pagination.pages
                    }
                    className="rounded-lg border border-gray-700 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </section>

        <p className="mt-5 text-xs leading-5 text-gray-500">
          Privacy safeguard: this view does not display account email
          addresses or names. Request status and grace deadlines are
          informational and do not confirm that underlying data has been
          deleted.
        </p>
      </div>
    </main>
  );
}