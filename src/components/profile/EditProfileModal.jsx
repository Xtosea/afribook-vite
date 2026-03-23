// src/components/profile/EditProfileModal.jsx
import React from "react";

const EditProfileModal = ({
  editing,
  setEditing,
  formData,
  setFormData,
  handleSave,
  user,
}) => {
  if (!editing) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.files[0] });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        {/* TEXT FIELDS */}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 w-full mb-3"
        />
        <input
          type="text"
          name="bio"
          placeholder="Bio"
          value={formData.bio}
          onChange={handleChange}
          className="border p-2 w-full mb-3"
        />
        <input
          type="text"
          name="intro"
          placeholder="Intro"
          value={formData.intro}
          onChange={handleChange}
          className="border p-2 w-full mb-3"
        />
        <input
          type="text"
          name="dob"
          placeholder="Date of Birth"
          value={formData.dob}
          onChange={handleChange}
          className="border p-2 w-full mb-3"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="border p-2 w-full mb-3"
        />
        <input
          type="text"
          name="education"
          placeholder="Education"
          value={formData.education}
          onChange={handleChange}
          className="border p-2 w-full mb-3"
        />
        <input
          type="text"
          name="origin"
          placeholder="Origin"
          value={formData.origin}
          onChange={handleChange}
          className="border p-2 w-full mb-3"
        />
        <input
          type="text"
          name="maritalStatus"
          placeholder="Marital Status"
          value={formData.maritalStatus}
          onChange={handleChange}
          className="border p-2 w-full mb-3"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 w-full mb-3"
        />

        {/* FILE UPLOADS */}
        <label className="block mb-1 font-semibold">Profile Picture</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, "profilePic")}
          className="mb-3"
        />

        <label className="block mb-1 font-semibold">Cover Photo</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, "coverPhoto")}
          className="mb-3"
        />

        {/* BUTTONS */}
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