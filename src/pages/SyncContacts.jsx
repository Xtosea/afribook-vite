// src/pages/SyncContacts.jsx
import { useNavigate } from "react-router-dom";

export default function SyncContacts() {
  const navigate = useNavigate();

  const handleSkip = () => navigate("/edit-profile");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6">Sync Contacts</h1>
      <p className="mb-4 text-gray-600">Find friends from your phone contacts</p>

      <button className="bg-blue-500 text-white px-6 py-3 rounded mb-4">
        Sync Contacts
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