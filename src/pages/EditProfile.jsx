import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();

  const [name, setName] = useState(
    localStorage.getItem("name") || ""
  );

  const [profilePic, setProfilePic] = useState(
    localStorage.getItem("profilePic") || ""
  );

  const saveProfile = async () => {
    try {
      // Save to localStorage
      localStorage.setItem("name", name);
      localStorage.setItem("profilePic", profilePic);

      // Optional backend update here
      // await fetch(...)

      alert("Profile saved!");

      // Go back home
      navigate("/");
    } catch (error) {
      console.error("Save profile error:", error);
      alert("Failed to save profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Edit Profile
        </h1>

        {/* Name Input */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Profile Picture URL */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Profile Picture URL
          </label>

          <input
            type="text"
            value={profilePic}
            onChange={(e) => setProfilePic(e.target.value)}
            placeholder="Enter image URL"
            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Preview */}
        {profilePic && (
          <div className="flex justify-center mb-4">
            <img
              src={profilePic}
              alt="Preview"
              className="w-24 h-24 rounded-full object-cover border"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={saveProfile}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition"
        >
          Save Profile & Go Home
        </button>
      </div>
    </div>
  );
}