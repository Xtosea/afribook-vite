import { useParams, useSearchParams } from "react-router-dom";

import {
  useEffect,
  useRef,
  useState,
} from "react";

export default function VerifyEmail() {

  const { token } = useParams();

  const [searchParams] =
    useSearchParams();

  const hasRun = useRef(false);

  const [status, setStatus] =
    useState("verifying");

  const [message, setMessage] =
    useState(
      "Please wait while we verify your email..."
    );

  // ======================================
  // VERIFY EMAIL
  // ======================================

  useEffect(() => {

    if (hasRun.current) return;

    hasRun.current = true;

    const email =
      searchParams.get("email");

    const verify = async () => {

      try {

        const res = await fetch(
          `https://afribook-backend.onrender.com/api/auth/verify/${token}?email=${email}`
        );

        const data = await res.json();

        console.log(data);

        // =========================
        // SUCCESS
        // =========================

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
            "Your email has been verified successfully. Redirecting you to AfricSocial..."
          );

          setTimeout(() => {

            window.location.href =
              "/welcome";

          }, 2500);

          return;

        }

        // =========================
        // ALREADY VERIFIED
        // =========================

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

        if (!res.ok)
          throw new Error(
            data.error
          );

      } catch (err) {

        setStatus("error");

        setMessage(
          err.message ||
            "Verification failed"
        );

      }

    };

    if (token) verify();

  }, [token, searchParams]);

  // ======================================
  // LOAD ADS SCRIPT
  // ======================================

  useEffect(() => {

    if (
      document.getElementById(
        "verify-email-ad-script"
      )
    ) {
      return;
    }

    const script =
      document.createElement(
        "script"
      );

    script.id =
      "verify-email-ad-script";

    script.async = true;

    script.setAttribute(
      "data-cfasync",
      "false"
    );

    script.src =
      "https://pl29467278.effectivecpmnetwork.com/1ac49ab91139c0ad3e13572497cfbe18/invoke.js";

    document.body.appendChild(
      script
    );

  }, []);

  return (

    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-blue-600
        via-indigo-600
        to-purple-700
        flex
        items-center
        justify-center
        px-4
        py-10
      "
    >

      <div
        className="
          bg-white
          w-full
          max-w-md
          rounded-3xl
          shadow-2xl
          overflow-hidden
        "
      >

        {/* TOP SECTION */}

        <div
          className="
            bg-gradient-to-r
            from-blue-500
            to-indigo-600
            p-8
            text-white
            text-center
          "
        >

          <div className="text-6xl mb-4">
            📧
          </div>

          <h1
            className="
              text-3xl
              font-bold
              mb-2
            "
          >
            Verify Your Email
          </h1>

          <p
            className="
              text-blue-100
              text-sm
            "
          >
            AfricSocial Account
            Security Check
          </p>

        </div>

        {/* BODY */}

        <div className="p-8 text-center">

          {/* STATUS ICON */}

          <div className="mb-5">

            {status ===
              "verifying" && (

              <div
                className="
                  animate-spin
                  rounded-full
                  h-14
                  w-14
                  border-4
                  border-blue-500
                  border-t-transparent
                  mx-auto
                "
              ></div>

            )}

            {status ===
              "success" && (

              <div className="text-6xl">
                ✅
              </div>

            )}

            {status ===
              "already" && (

              <div className="text-6xl">
                👍
              </div>

            )}

            {status ===
              "error" && (

              <div className="text-6xl">
                ❌
              </div>

            )}

          </div>

          {/* MESSAGE */}

          <h2
            className="
              text-2xl
              font-bold
              text-gray-800
              mb-3
            "
          >

            {status ===
              "verifying" &&
              "Checking Verification"}

            {status ===
              "success" &&
              "Verification Successful"}

            {status ===
              "already" &&
              "Already Verified"}

            {status ===
              "error" &&
              "Verification Failed"}

          </h2>

          <p
            className="
              text-gray-600
              leading-relaxed
              mb-6
            "
          >
            {message}
          </p>

          {/* INFO BOX */}

          <div
            className="
              bg-blue-50
              border
              border-blue-100
              rounded-2xl
              p-4
              text-left
            "
          >

            <h3
              className="
                font-semibold
                text-blue-700
                mb-2
              "
            >
              Why verify your email?
            </h3>

            <ul
              className="
                text-sm
                text-gray-600
                space-y-2
              "
            >

              <li>
                ✅ Protect your account
              </li>

              <li>
                ✅ Recover your password
                easily
              </li>

              <li>
                ✅ Access all AfricSocial
                features
              </li>

              <li>
                ✅ Connect safely with
                other users
              </li>

            </ul>

          </div>

          {/* AD SECTION */}

          <div className="mt-6">

            <div
              id="container-1ac49ab91139c0ad3e13572497cfbe18"
              className="
                rounded-2xl
                overflow-hidden
              "
            ></div>

          </div>

          {/* FOOTER */}

          <p
            className="
              text-xs
              text-gray-400
              mt-6
            "
          >
            🚀 Join Africa's fastest
            growing social network
          </p>

        </div>

      </div>

    </div>

  );

}