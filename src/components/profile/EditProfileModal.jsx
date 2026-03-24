// src/components/profile/EditProfileModal.jsx
import React from "react";

const EditProfileModal = ({
  editing,
  setEditing,
  formData,
  handleSave,
  handleInputChange,
  handleFileChange,
  saving,
  uploadProgress,
}) => {
  if (!editing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3"
        />

        {/* Bio */}
        <input
          type="text"
          name="bio"
          placeholder="Bio"
          value={formData.bio}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3"
        />

        {/* Intro */}
        <input
          type="text"
          name="intro"
          placeholder="Intro"
          value={formData.intro}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3"
        />

        {/* DOB */}
        <input
          type="date"
          name="dob"
          placeholder="DOB"
          value={formData.dob}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3"
        />

        {/* Phone */}
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3"
        />

        {/* Education */}
        <input
          type="text"
          name="education"
          placeholder="Education"
          value={formData.education}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3"
        />

        {/* Origin */}
        <input
          type="text"
          name="origin"
          placeholder="Origin"
          value={formData.origin}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3"
        />

        {/* Marital Status */}
        <input
          type="text"
          name="maritalStatus"
          placeholder="Marital Status"
          value={formData.maritalStatus}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3"
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3"
        />

        {/* Profile Picture */}
        <label className="block mb-2">Profile Picture:</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, "profilePic")}
          className="mb-3"
        />

        {/* Cover Photo */}
        <label className="block mb-2">Cover Photo:</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, "coverPhoto")}
          className="mb-3"
        />

        {/* Upload Progress */}
        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 h-2 rounded mb-3">
            <div
              className="bg-blue-500 h-2 rounded"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={() => setEditing(false)}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded text-white ${saving ? "bg-blue-300" : "bg-blue-500"}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;