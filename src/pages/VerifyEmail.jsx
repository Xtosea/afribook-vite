import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function VerifyEmail() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const email = searchParams.get("email");

    const verify = async () => {

  try {

    setStatus("verifying");

    const email =
      searchParams.get("email") || "";

    const res = await fetch(
      `https://afribook-backend.onrender.com/api/auth/verify/${token}?email=${encodeURIComponent(email)}`
    );

    const data = await res.json();

    console.log(data);

    // SUCCESS
    if (data.token) {

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "userId",
        data.user._id
      );

      localStorage.setItem(
        "name",
        data.user.name
      );

      localStorage.setItem(
        "profilePic",
        data.user.profilePic || ""
      );

      setStatus("success");

      setMessage(
        "Your email has been verified successfully. Redirecting..."
      );

      setTimeout(() => {

        window.location.href =
          "/welcome";

      }, 2500);

      return;

    }

    // ALREADY VERIFIED
    if (
      data.message ===
      "User already verified"
    ) {

      setStatus("already");

      setMessage(
        "Your email is already verified. Redirecting to login..."
      );

      setTimeout(() => {

        window.location.href =
          "/login";

      }, 2500);

      return;

    }

    // ERROR RESPONSE
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
      err.message ||
      "Something went wrong"
    );

  }

};
    if (token) verify();
  }, [token, searchParams]);


useEffect(() => {

  if (document.getElementById("verify-email-ad-script")) {
    return;
  }

  const script = document.createElement("script");

  script.id = "verify-email-ad-script";

  script.async = true;

  script.setAttribute("data-cfasync", "false");

  script.src =
    "https://pl29467278.effectivecpmnetwork.com/1ac49ab91139c0ad3e13572497cfbe18/invoke.js";

  document.body.appendChild(script);

}, []);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        
        <div className="text-5xl mb-4">🎉</div>

        <h2 className="text-2xl font-bold mb-2">
          Welcome to AfricSocial 
        </h2>

        <p className="text-gray-600 mb-6">
          We're verifying your email and preparing your account.
          This will only take a few seconds...
        </p>

        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>


   {/* AD HERE */}

<p className="text-sm text-gray-400 mt-6">
  You're about to join Africa's fastest growing social network 🚀
</p>


        <p className="text-sm text-gray-400 mt-6">
          You're about to join Africa's fastest growing social network 🚀
        </p>

      </div>
    </div>
  );
}