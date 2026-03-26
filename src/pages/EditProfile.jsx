// src/pages/EditProfile.jsx
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();

  const handleSkip = () => navigate("/");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <p className="mb-4 text-gray-600">Add a profile picture and bio to get started</p>

      <button className="bg-blue-500 text-white px-6 py-3 rounded mb-4">
        Upload Profile Picture
      </button>

      <button
        onClick={handleSkip}
        className="text-blue-600 underline"
      >
        Skip
      </button>
    </div>
  );
}