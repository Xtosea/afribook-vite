// src/components/profile/EditProfileModal.jsx
import React from "react";

const EditProfileModal = ({
  editing,
  setEditing,
  formData,
  handleSave,
  handleInputChange,
  handleFileChange,
  user
}) => {
  if (!editing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3"
        />

        <input
          type="text"
          name="bio"
          placeholder="Bio"
          value={formData.bio}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3"
        />

        <label className="block mb-2">Profile Picture:</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, "profilePic")}
          className="mb-3"
        />

        <label className="block mb-2">Cover Photo:</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, "coverPhoto")}
          className="mb-3"
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;