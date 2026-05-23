// src/pages/VerifyEmailSent.jsx

import React, {
  useEffect,
} from "react";

import {
  Link,
} from "react-router-dom";

export default function VerifyEmailSent() {

  

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

        {/* TOP HEADER */}

        <div
          className="
            bg-gradient-to-r
            from-blue-500
            to-indigo-600
            text-white
            text-center
            p-8
          "
        >

          <div className="text-6xl mb-4">
            📩
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
            One more step to join
            AfricSocial 🚀
          </p>

        </div>

        {/* BODY */}

        <div className="p-8">

          {/* SUCCESS MESSAGE */}

          <div
            className="
              bg-green-50
              border
              border-green-100
              rounded-2xl
              p-5
              mb-6
              text-center
            "
          >

            <div className="text-5xl mb-3">
              ✅
            </div>

            <h2
              className="
                text-xl
                font-bold
                text-gray-800
                mb-2
              "
            >
              Verification Email Sent
            </h2>

            <p
              className="
                text-gray-600
                text-sm
                leading-relaxed
              "
            >
              We've sent a verification
              link to your email address.
              Please check your inbox and
              click the link to activate
              your AfricSocial account.
            </p>

          </div>

          {/* STEPS */}

          <div
            className="
              bg-blue-50
              border
              border-blue-100
              rounded-2xl
              p-5
              mb-6
            "
          >

            <h3
              className="
                font-bold
                text-blue-700
                mb-4
              "
            >
              Next Steps
            </h3>

            <div className="space-y-4">

              <div className="flex gap-3">

                <div
                  className="
                    bg-blue-600
                    text-white
                    w-7
                    h-7
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-sm
                    font-bold
                    shrink-0
                  "
                >
                  1
                </div>

                <p
                  className="
                    text-sm
                    text-gray-700
                  "
                >
                  Open your email inbox
                </p>

              </div>

              <div className="flex gap-3">

                <div
                  className="
                    bg-blue-600
                    text-white
                    w-7
                    h-7
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-sm
                    font-bold
                    shrink-0
                  "
                >
                  2
                </div>

                <p
                  className="
                    text-sm
                    text-gray-700
                  "
                >
                  Find the verification
                  email from AfricSocial
                </p>

              </div>

              <div className="flex gap-3">

                <div
                  className="
                    bg-blue-600
                    text-white
                    w-7
                    h-7
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-sm
                    font-bold
                    shrink-0
                  "
                >
                  3
                </div>

                <p
                  className="
                    text-sm
                    text-gray-700
                  "
                >
                  Click the verification
                  button/link inside the
                  email
                </p>

              </div>

            </div>

          </div>

          {/* NOTE */}

          <div
            className="
              bg-yellow-50
              border
              border-yellow-100
              rounded-2xl
              p-4
              text-sm
              text-gray-700
              mb-6
            "
          >

            <span className="font-semibold">
              Didn't receive the email?
            </span>

            <ul className="mt-2 space-y-1">

              <li>
                • Check your spam or junk
                folder
              </li>

              <li>
                • Wait a few minutes and
                refresh your inbox
              </li>

              <li>
                • Make sure your email was
                entered correctly
              </li>

            </ul>

          </div>

          {/* BUTTONS */}

          <div className="flex flex-col gap-3">

            <Link
              to="/login"
              className="
                bg-blue-600
                hover:bg-blue-700
                text-white
                text-center
                py-3
                rounded-2xl
                font-semibold
                transition
              "
            >
              Go To Login
            </Link>

            <Link
              to="/register"
              className="
                border
                border-gray-300
                hover:bg-gray-100
                text-gray-700
                text-center
                py-3
                rounded-2xl
                font-semibold
                transition
              "
            >
              Register Again
            </Link>

          </div>

          

          {/* FOOTER */}

          <p
            className="
              text-center
              text-xs
              text-gray-400
              mt-6
            "
          >
            🌍 Connect, share and grow
            with Africa's social community
          </p>

        </div>

      </div>

    </div>

  );

}