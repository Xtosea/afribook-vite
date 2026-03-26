import { useNavigate } from "react-router-dom";

export default function SyncContacts() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-green-50">
      <h1 className="text-3xl font-bold mb-4">📇 Sync Contacts</h1>
      <p className="text-gray-600 mb-6 text-center">
        Sync your phone contacts to find friends already on Afribook.
      </p>

      <button
        onClick={() => navigate("/edit-profile")}
        className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition"
      >
        Next: Edit Profile
      </button>

      <button
        onClick={() => navigate("/")}
        className="mt-4 bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-400 transition"
      >
        Skip / Go to Home
      </button>
    </div>
  );
}