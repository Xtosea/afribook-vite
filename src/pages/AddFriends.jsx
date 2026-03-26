// src/pages/AddFriends.jsx
import { useNavigate } from "react-router-dom";

export default function AddFriends() {
  const navigate = useNavigate();

  const handleSkip = () => navigate("/sync-contacts");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6">Add Friends</h1>
      <p className="mb-4 text-gray-600">Start by adding people you know</p>

      {/* Example: list of suggested friends */}
      <div className="space-y-3 mb-6">
        <button className="bg-gray-100 px-4 py-2 rounded w-64">Add Friend 1</button>
        <button className="bg-gray-100 px-4 py-2 rounded w-64">Add Friend 2</button>
      </div>

      <button
        onClick={handleSkip}
        className="text-blue-600 underline"
      >
        Skip
      </button>
    </div>
  );
}