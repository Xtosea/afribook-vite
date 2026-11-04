import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE, fetchWithToken } from "../api/api";

const DAY_MS = 24 * 60 * 60 * 1000;
const GRACE_PERIOD_MS = 30 * DAY_MS;

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusLabel(status) {
  const labels = {
    pending: "Pending",
    requested: "Requested",
    processing: "Processing",
    review_required: "Under review",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return labels[status] || "No active request";
}

export default function DeleteAccount() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [status, setStatus] = useState(null);
  const [requestedAt, setRequestedAt] = useState(null);
  const [reviewReason, setReviewReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadStatus = useCallback(async () => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);

    if (!currentToken) {
      setStatus(null);
      setRequestedAt(null);
      setReviewReason("");
      setStatusLoaded(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setStatusLoaded(false);
    setError("");

    try {
      const result = await fetchWithToken(
        `${API_BASE}/api/account/delete/status`,
        currentToken,
        { retryNetworkErrors: false }
      );

      if (!result?.success) {
        throw new Error(
          result?.message || "Unable to check your deletion-request status."
        );
      }

      setStatus(result.status || "none");
      setRequestedAt(result.requestedAt || null);
      setReviewReason(result.reviewReason || "");
      setStatusLoaded(true);
    } catch (err) {
      setError(
        err?.message || "Unable to check your deletion-request status."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  async function submitDeletionRequest() {
    if (!token || submitting) return;

    const confirmed = window.confirm(
      "Are you sure you want to request deletion of your AfricSocial account?\n\n" +
        "This starts the account-deletion process. It does not mean your account " +
        "will be deleted immediately. You may be able to cancel during the " +
        "30-day grace period while your request remains pending."
    );

    if (!confirmed) return;

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const result = await fetchWithToken(
        `${API_BASE}/api/account/delete`,
        token,
        {
          method: "DELETE",
          retryNetworkErrors: false,
        }
      );

      if (!result?.success) {
        throw new Error(
          result?.message || "Unable to submit your deletion request."
        );
      }

      setMessage(
        result.message || "Your account-deletion request has been received."
      );

      await loadStatus();
    } catch (err) {
      setError(
        err?.message || "Unable to submit your deletion request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelDeletionRequest() {
    if (!token || submitting) return;

    const confirmed = window.confirm(
      "Do you want to cancel your pending account-deletion request?"
    );

    if (!confirmed) return;

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const result = await fetchWithToken(
        `${API_BASE}/api/account/delete/cancel`,
        token,
        {
          method: "POST",
          retryNetworkErrors: false,
        }
      );

      if (!result?.success) {
        throw new Error(
          result?.message || "Unable to cancel your deletion request."
        );
      }

      setMessage(result.message || "Your deletion request was cancelled.");

      await loadStatus();
    } catch (err) {
      setError(
        err?.message || "Unable to cancel your deletion request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const requestDate = requestedAt ? new Date(requestedAt) : null;
  const validRequestDate =
    requestDate && !Number.isNaN(requestDate.getTime());

  const cancellationDeadline = validRequestDate
    ? new Date(requestDate.getTime() + GRACE_PERIOD_MS)
    : null;

  const cancellationEligible =
    status === "pending" &&
    validRequestDate &&
    requestDate.getTime() <= Date.now() &&
    Date.now() < cancellationDeadline.getTime();

  const canRequestDeletion =
    !status || status === "none" || status === "cancelled";

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-gray-800">
      <p className="text-blue-600 font-semibold">AfricSocial</p>

      <h1 className="text-3xl font-bold mt-2 mb-4">
        Request Account Deletion
      </h1>

      <p className="leading-7">
        You can request deletion of your AfricSocial account even if
        you cannot currently sign in. We must verify that you own the
        account before authorising a deletion.
      </p>

      <section className="mt-8 rounded-xl border p-5">
        <h2 className="text-xl font-semibold mb-3">
          If you can sign in
        </h2>

        <p className="leading-7">
          Sign in to AfricSocial to check your deletion-request status,
          submit a request or cancel an eligible pending request.
        </p>

        {!token && (
          <Link
            to="/login"
            className="inline-block mt-4 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Sign in to manage your request
          </Link>
        )}

        {token && (
          <div className="mt-5 rounded-lg bg-gray-50 border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold">Your deletion-request status</h3>

              <button
                type="button"
                onClick={loadStatus}
                disabled={loading || submitting}
                className="text-blue-600 underline disabled:opacity-50"
              >
                Refresh status
              </button>
            </div>

            {loading && (
              <p className="mt-3 text-sm text-gray-600">
                Checking your account status...
              </p>
            )}

            {statusLoaded && !loading && (
              <p className="mt-3">
                <span className="font-medium">Status: </span>
                {getStatusLabel(status)}
              </p>
            )}

            {statusLoaded && !loading && requestedAt && (
              <p className="mt-2 text-sm text-gray-600">
                <strong>Request date:</strong> {formatDate(requestedAt)}
              </p>
            )}

            {statusLoaded && !loading && cancellationDeadline && (
              <p className="mt-2 text-sm text-gray-600">
                <strong>30-day grace-period deadline:</strong>{" "}
                {formatDate(cancellationDeadline)}
              </p>
            )}

            {statusLoaded && !loading && reviewReason && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="font-semibold text-amber-900">
                  Review information
                </p>
                <p className="mt-1 text-sm text-amber-900">
                  {reviewReason}
                </p>
              </div>
            )}

            {statusLoaded && !loading && canRequestDeletion && (
              <div className="mt-4">
                <p className="text-sm leading-6 text-gray-600">
                  You do not currently have an active deletion request.
                  You can submit one below.
                </p>

                <button
                  type="button"
                  onClick={submitDeletionRequest}
                  disabled={submitting}
                  className="mt-3 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting
                    ? "Submitting..."
                    : "Request Account Deletion"}
                </button>
              </div>
            )}

            {statusLoaded && !loading && cancellationEligible && (
              <div className="mt-4">
                <p className="text-sm leading-6 text-gray-600">
                  Your request is pending and is within the 30-day
                  cancellation period.
                </p>

                <button
                  type="button"
                  onClick={cancelDeletionRequest}
                  disabled={submitting}
                  className="mt-3 rounded-lg border border-gray-400 px-5 py-3 font-semibold hover:bg-gray-100 disabled:opacity-50"
                >
                  {submitting ? "Please wait..." : "Cancel Deletion Request"}
                </button>
              </div>
            )}

            {statusLoaded && !loading && status === "pending" && !cancellationEligible && (
              <p className="mt-4 text-sm text-amber-800">
                This request is not currently eligible for cancellation
                through the 30-day grace-period option. Contact the
                Privacy Team if you need assistance.
              </p>
            )}

            {statusLoaded && !loading &&
              ["requested", "processing", "review_required"].includes(status) && (
                <p className="mt-4 text-sm text-amber-800">
                  Your request is being processed or reviewed. The
                  cancellation option is not currently available.
                </p>
              )}

            {statusLoaded && !loading && status === "completed" && (
              <p className="mt-4 text-sm text-green-700">
                AfricSocial's system reports that your account deletion request is marked as completed. Contact the Privacy Team if you have questions.
              </p>
            )}
          </div>
        )}
      </section>

      {message && (
        <div
          role="status"
          className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
        >
          {error}
        </div>
      )}

      <section className="mt-5 rounded-xl border p-5">
        <h2 className="text-xl font-semibold mb-3">
          If you cannot sign in
        </h2>

        <p className="leading-7">
          Email our privacy team from the email address associated
          with your account, if you can access it. Explain that you
          want to request AfricSocial account deletion. If you cannot
          access that address, tell us so we can explain the available
          identity-verification steps.
        </p>

        <a
          href="mailto:privacy@africsocial.com?subject=AfricSocial%20Account%20Deletion%20Request"
          className="inline-block mt-4 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Email the Privacy Team
        </a>

        <p className="mt-4 text-sm text-gray-600 leading-6">
          Never email your password, login token, verification code,
          or payment-card details. We may ask for appropriate
          information to verify account ownership. Do not send
          identity documents unless we explain a secure method and
          why they are necessary.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">
          What happens to your information?
        </h2>

        <p className="leading-7">
          A deletion request must be verified and processed before
          deletion can be confirmed. Processing may include removing
          account content and personal information where appropriate,
          cleaning up references to your account, and reviewing
          information that must be retained for legal, security, or
          financial reasons.
        </p>

        <p className="mt-3 leading-7">
          While deletion is pending, new wallet transactions are
          restricted. Outstanding balances and pending payouts must
          be identified and resolved or flagged for review. Only
          financial records required for legal, accounting, or dispute
          obligations should be retained.
        </p>

        <p className="mt-3 leading-7">
          Sending a request does not mean your account has already
          been deleted. We will not treat a request as completed
          until the required deletion and cleanup process has actually
          finished.
        </p>
      </section>

      <div className="mt-8 rounded-xl bg-amber-50 border border-amber-200 p-4">
        <p className="font-semibold">Important information</p>
        <p className="mt-2 leading-6">
          A deletion request starts a process; it does not immediately
          erase your account. Financial obligations and required
          records must be handled before deletion can be confirmed.
          If additional review is necessary, the request may remain
          under review.
        </p>
      </div>

      <nav className="mt-8 flex flex-wrap gap-5">
        <Link to="/privacy" className="text-blue-600 underline">
          Privacy Policy
        </Link>

        <Link to="/login" className="text-blue-600 underline">
          Sign in
        </Link>
      </nav>
    </main>
  );
}