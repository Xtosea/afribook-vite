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
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        {/* Name */}
        <div className="mb-3">
          <label className="block mb-1">👤 Name</label>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Bio */}
        <div className="mb-3">
          <label className="block mb-1">📝 Bio</label>
          <input
            type="text"
            name="bio"
            placeholder="Bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Intro */}
        <div className="mb-3">
          <label className="block mb-1">📖 Intro</label>
          <input
            type="text"
            name="intro"
            placeholder="Intro"
            value={formData.intro}
            onChange={handleInputChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* DOB */}
        <div className="mb-3">
          <label className="block mb-1">🎂 DOB</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Phone */}
        <div className="mb-3">
          <label className="block mb-1">📞 Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Education */}
        <div className="mb-3">
          <label className="block mb-1">🎓 Education</label>
          <input
            type="text"
            name="education"
            value={formData.education}
            onChange={handleInputChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Origin */}
        <div className="mb-3">
          <label className="block mb-1">🌍 Origin</label>
          <input
            type="text"
            name="origin"
            value={formData.origin}
            onChange={handleInputChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Marital Status */}
        <div className="mb-3">
          <label className="block mb-1">💍 Status</label>
          <input
            type="text"
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleInputChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Spouse */}
        <div className="mb-3">
          <label className="block mb-1">🧑‍🤝‍🧑 Spouse</label>
          <input
            type="text"
            name="spouse"
            value={formData.spouse || ""}
            onChange={handleInputChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Gender */}
        <div className="mb-3">
          <label className="block mb-1">⚧ Gender</label>
          <input
            type="text"
            name="gender"
            value={formData.gender || ""}
            onChange={handleInputChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="block mb-1">📧 Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Profile Picture */}
        <div className="mb-3">
          <label className="block mb-1">🖼️ Profile Picture</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "profilePic")}
            className="mb-2"
          />
          {formData.profilePic && (
            <img
              src={URL.createObjectURL(formData.profilePic)}
              alt="Preview"
              className="w-24 h-24 object-cover rounded mb-2"
            />
          )}
        </div>

        {/* Cover Photo */}
        <div className="mb-3">
          <label className="block mb-1">🖼️ Cover Photo</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "coverPhoto")}
            className="mb-2"
          />
          {formData.coverPhoto && (
            <img
              src={URL.createObjectURL(formData.coverPhoto)}
              alt="Preview"
              className="w-full h-24 object-cover rounded mb-2"
            />
          )}
        </div>

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
            className={`px-4 py-2 rounded text-white ${
              saving ? "bg-blue-300" : "bg-blue-500"
            }`}
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