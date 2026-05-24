import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function VerifyEmail() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const hasRun = useRef(false);

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState(
    "Please wait while we verify your email..."
  );

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verify = async () => {
      try {
        setStatus("verifying");

        const email = searchParams.get("email") || "";

        // ✅ FIXED ENDPOINT
        const res = await fetch(
          `https://africsocial.globelynks.com/api/auth/verify/${token}?email=${encodeURIComponent(
            email
          )}`
        );

        const data = await res.json();

        console.log(data);

        // SUCCESS
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.user._id);
          localStorage.setItem("name", data.user.name || "");
          localStorage.setItem(
            "profilePic",
            data.user.profilePic || ""
          );

          setStatus("success");
          setMessage(
            "Email verified successfully. Redirecting..."
          );

          setTimeout(() => {
            window.location.href = "/welcome";
          }, 2500);

          return;
        }

        // ALREADY VERIFIED
        if (data.message === "User already verified") {
          setStatus("already");
          setMessage(
            "Already verified. Redirecting to login..."
          );

          setTimeout(() => {
            window.location.href = "/login";
          }, 2500);

          return;
        }

        // ERROR
        if (!res.ok) {
          throw new Error(
            data.error ||
              data.message ||
              "Verification failed"
          );
        }

      } catch (err) {
        console.error(err);

        setStatus("error");
        setMessage(
          err.message || "Something went wrong"
        );
      }
    };

    if (token) {
      verify();
    }

  }, [token, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">

        {status === "verifying" && (
          <>
            <div className="text-5xl mb-4">⏳</div>

            <h2 className="text-2xl font-bold mb-2">
              Verifying Email
            </h2>

            <p className="text-gray-600 mb-6">
              {message}
            </p>

            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl mb-4">🎉</div>

            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Verified!
            </h2>

            <p className="text-gray-600">
              {message}
            </p>
          </>
        )}

        {status === "already" && (
          <>
            <div className="text-5xl mb-4">ℹ️</div>

            <h2 className="text-2xl font-bold mb-2">
              Already Verified
            </h2>

            <p className="text-gray-600">
              {message}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>

            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Verification Failed
            </h2>

            <p className="text-gray-600">
              {message}
            </p>
          </>
        )}
      </div>
    </div>
  );
}