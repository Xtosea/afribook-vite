import React, { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchWithToken } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function PaystackCallback() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentType, setPaymentType] = useState("premium");

  useEffect(() => {
    if (!token) return;

    const reference = searchParams.get("reference");

    if (!reference) {
      setLoading(false);
      setSuccess(false);
      setMessage("No Paystack transaction reference was found.");
      return;
    }

    const verifyPayment = async () => {
      try {
        setLoading(true);

        const result = await fetchWithToken(
          `/api/payments/paystack/verify/${encodeURIComponent(reference)}`,
          token
        );

        /*
         * Advertisement verification returns a campaign object.
         * Premium/other payments do not use this field.
         */
        if (result?.campaign) {
          setPaymentType("advertisement");
        } else if (result?.boost) {
          setPaymentType("boost");
        } else {
          setPaymentType("premium");
        }

        setSuccess(result?.success === true);
        setMessage(
          result?.message ||
            "Payment verification completed."
        );
      } catch (error) {
        console.error(
          "PAYSTACK CALLBACK ERROR:",
          error
        );

        setSuccess(false);
        setMessage(
          error?.message ||
            "Payment verification failed."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [token, searchParams]);

  const goToDestination = () => {
    if (paymentType === "advertisement") {
      navigate("/ads/campaigns");
      return;
    }

    if (paymentType === "boost") {
      navigate("/");
      return;
    }

    navigate("/premium");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl border shadow-sm p-8 text-center">
        {loading ? (
          <>
            <Loader2
              size={48}
              className="mx-auto text-blue-600 animate-spin"
            />

            <h1 className="text-2xl font-bold mt-5">
              Verifying your payment
            </h1>

            <p className="text-gray-500 mt-2">
              Please wait while AfricSocial confirms
              your Paystack payment.
            </p>
          </>
        ) : success ? (
          <>
            <CheckCircle
              size={56}
              className="mx-auto text-green-600"
            />

            <h1 className="text-2xl font-bold mt-5">
              Payment Successful
            </h1>

            <p className="text-gray-600 mt-3">
              {message}
            </p>

            <button
              type="button"
              onClick={goToDestination}
              className="mt-6 w-full px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              {paymentType === "advertisement"
                ? "View My Campaigns"
                : paymentType === "boost"
                ? "Return to AfricSocial"
                : "Go to Premium"}
            </button>
          </>
        ) : (
          <>
            <XCircle
              size={56}
              className="mx-auto text-red-600"
            />

            <h1 className="text-2xl font-bold mt-5">
              Payment Verification Failed
            </h1>

            <p className="text-gray-600 mt-3">
              {message}
            </p>

            <button
              type="button"
              onClick={goToDestination}
              className="mt-6 w-full px-5 py-3 rounded-xl bg-gray-800 text-white font-semibold hover:bg-gray-900"
            >
              {paymentType === "advertisement"
                ? "Return to Campaigns"
                : paymentType === "boost"
                ? "Return to AfricSocial"
                : "Return to Premium"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
