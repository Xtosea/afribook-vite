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

  const [loading, setLoading] = useState(false);

  const saveProfile = async () => {
    try {
      setLoading(true);

      // Save to localStorage
      localStorage.setItem("name", name);
      localStorage.setItem("profilePic", profilePic);

      // Optional backend save
      // await fetch(...)

      alert("Profile saved successfully!");

      // Redirect
      navigate("/");

    } catch (error) {
      console.error("Save profile error:", error);
      alert("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Edit Profile
        </h1>

        {/* Name */}
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

        {/* Profile Picture */}
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
                e.currentTarget.src =
                  "https://via.placeholder.com/150";
              }}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">

          <button
            type="button"
            onClick={saveProfile}
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-black py-3 rounded-lg font-semibold transition"
          >
            Cancel
          </button>

        </div>
      </div>
    </div>
  );
}