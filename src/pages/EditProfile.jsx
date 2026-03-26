import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePic") || "");
  const navigate = useNavigate();

  const saveProfile = async () => {
    // TODO: call backend to update profile
    alert("Profile saved!");
    localStorage.setItem("name", name);
    localStorage.setItem("profilePic", profilePic);
    navigate("/"); // Go to Home
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Edit Profile</h1>

      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name"
        className="w-full border p-2 rounded mb-2"
      />

      <input
        value={profilePic}
        onChange={e => setProfilePic(e.target.value)}
        placeholder="Profile Pic URL"
        className="w-full border p-2 rounded mb-2"
      />

      <button
        onClick={saveProfile}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save Profile & Go Home
      </button>
    </div>
  );
}