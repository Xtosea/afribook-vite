import { useNavigate } from "react-router-dom";

export default function WelcomeOnboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg w-full text-center">

        <div className="text-6xl mb-4">🎉</div>

        <h1 className="text-3xl font-bold mb-3">
          Welcome to Afribook
        </h1>

        <p className="text-gray-600 mb-6">
          Your account is ready! Start connecting, sharing, and earning on
          Africa's fastest growing social platform.
        </p>

        {/* Options for user */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <button
            onClick={() => navigate("/add-friends")}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition"
          >
            Add Friends
          </button>

          <button
            onClick={() => navigate("/sync-contacts")}
            className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition"
          >
            Sync Contacts
          </button>

          <button
            onClick={() => navigate("/edit-profile")}
            className="bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 transition"
          >
            Edit Profile
          </button>

          <button
            onClick={() => navigate("/")}
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-400 transition"
          >
            Skip / Go to Home
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Choose what you want to do first
        </p>
      </div>
    </div>
  );
}