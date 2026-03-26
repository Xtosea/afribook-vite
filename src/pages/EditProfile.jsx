import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [bio, setBio] = useState("");

  const handleSave = () => {
    // call API to save profile
    localStorage.setItem("name", name);
    alert("Profile updated!");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-purple-50">
      <h1 className="text-3xl font-bold mb-4">✏️ Edit Profile</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="border rounded-lg p-3 mb-4 w-full max-w-md"
      />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Bio"
        className="border rounded-lg p-3 mb-4 w-full max-w-md"
      />
      <button
        onClick={handleSave}
        className="bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 transition"
      >
        Save & Go to Home
      </button>
    </div>
  );
}