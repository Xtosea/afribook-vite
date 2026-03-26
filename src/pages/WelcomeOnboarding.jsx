// src/pages/WelcomeOnboarding.jsx
import { useNavigate } from "react-router-dom";

export default function WelcomeOnboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-3">Welcome to Afribook</h1>
        <p className="text-gray-600 mb-6">
          Your account is ready! Start connecting, sharing, and earning on Africa's fastest growing social platform.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-6">
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="text-xl mb-1">👥</div>
            <h3 className="font-semibold">Find Friends</h3>
            <p className="text-sm text-gray-500">Connect with people you know</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="text-xl mb-1">📸</div>
            <h3 className="font-semibold">Share Moments</h3>
            <p className="text-sm text-gray-500">Post photos, videos & stories</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="text-xl mb-1">💰</div>
            <h3 className="font-semibold">Earn Points</h3>
            <p className="text-sm text-gray-500">Get rewarded for engagement</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="text-xl mb-1">🔥</div>
            <h3 className="font-semibold">Go Viral</h3>
            <p className="text-sm text-gray-500">Reach thousands of users</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/add-friends")}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Start Exploring
        </button>
      </div>
    </div>
  );
}