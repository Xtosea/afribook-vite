// src/components/profile/EditProfileModal.jsx
import React from "react";

const EditProfileModal = ({
  editing,
  setEditing,
  formData,
  handleInputChange,
  handleFileChange,
  handleSave,
  user
}) => {
  if (!editing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        {/* NAME & BIO */}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3 rounded"
        />

        <input
          type="text"
          name="bio"
          placeholder="Bio"
          value={formData.bio}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3 rounded"
        />

        {/* INTRO */}
        <input
          type="text"
          name="intro"
          placeholder="Intro"
          value={formData.intro}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3 rounded"
        />

        {/* DOB */}
        <input
          type="date"
          name="dob"
          placeholder="Date of Birth"
          value={formData.dob}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3 rounded"
        />

        {/* PHONE */}
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3 rounded"
        />

        {/* EDUCATION */}
        <input
          type="text"
          name="education"
          placeholder="Education"
          value={formData.education}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3 rounded"
        />

        {/* ORIGIN */}
        <input
          type="text"
          name="origin"
          placeholder="Origin"
          value={formData.origin}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3 rounded"
        />

        {/* MARITAL STATUS */}
        <input
          type="text"
          name="maritalStatus"
          placeholder="Marital Status"
          value={formData.maritalStatus}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3 rounded"
        />

        {/* EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          className="border p-2 w-full mb-3 rounded"
        />

        {/* PROFILE PICTURE */}
        <label className="block mb-1 font-semibold">Profile Picture</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, "profilePic")}
          className="mb-3 w-full"
        />

        {/* COVER PHOTO */}
        <label className="block mb-1 font-semibold">Cover Photo</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, "coverPhoto")}
          className="mb-3 w-full"
        />

        {/* ACTION BUTTONS */}
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