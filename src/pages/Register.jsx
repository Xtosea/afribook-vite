// src/pages/Register.jsx

import React, { useState, useEffect } from "react";
import {
  useNavigate,
  useSearchParams,
  Link,
} from "react-router-dom";
import { API_BASE } from "../api/api";

export default function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

const [searchParams] = useSearchParams();

const redirect =
  searchParams.get("redirect") || "/";

  // =========================
  // LOAD AD SCRIPT
  // =========================

  useEffect(() => {

    const script = document.createElement("script");

    script.src =
      "https://pl29467278.effectivecpmnetwork.com/1ac49ab91139c0ad3e13572497cfbe18/invoke.js";

    script.async = true;

    script.setAttribute(
      "data-cfasync",
      "false"
    );

    document.body.appendChild(script);

    return () => {

      document.body.removeChild(script);

    };

  }, []);

  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const res = await fetch(
        `${API_BASE}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {

        alert(
          data.error ||
            "Registration failed"
        );

        return;
      }

      alert(
        data.message ||
          "Registration successful. Please verify your email."
      );

   navigate(
  `/verify-email-sent?redirect=${encodeURIComponent(redirect)}`
);

    } catch (err) {

      console.error(err);

      alert("Error registering user");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-gray-100 py-10 px-4">

      {/* REGISTER CARD */}

      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">

        <h1 className="text-3xl font-bold text-center mb-6">

          Create Account

        </h1>

        <form
          onSubmit={handleRegister}
          className="flex flex-col gap-4"
        >

          {/* NAME */}

          <input
            type="text"
            placeholder="Name"
            className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
          />

          {/* EMAIL */}

          <input
            type="email"
            placeholder="Email"
            className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          {/* PASSWORD */}

          <div className="relative">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              className="p-3 border rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              className="absolute right-3 top-3 text-sm text-gray-600"
            >
              {showPassword
                ? "Hide"
                : "Show"}
            </button>

          </div>

          {/* REGISTER BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="
              bg-blue-600
              hover:bg-blue-700
              text-white
              p-3
              rounded-xl
              transition
              flex
              justify-center
              items-center
              font-semibold
            "
          >

            {loading && (

              <span
                className="
                  animate-spin
                  border-2
                  border-white
                  border-t-transparent
                  rounded-full
                  w-5
                  h-5
                  mr-2
                "
              ></span>

            )}

            {loading
              ? "Registering..."
              : "Register"}

          </button>

        </form>

        {/* LINKS */}

        <div className="mt-5 text-sm text-gray-600 flex justify-between flex-wrap gap-2">

          <span>

            Already registered?{" "}

            <Link
              to="/login"
              className="text-blue-600 hover:underline"
            >
              Login
            </Link>

          </span>

          <span>

            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>

          </span>

        </div>

      </div>

      {/* AD SECTION */}

      <div className="max-w-md mx-auto mt-6">

        <div
          id="container-1ac49ab91139c0ad3e13572497cfbe18"
          className="rounded-xl overflow-hidden"
        ></div>

      </div>

    </div>

  );

}