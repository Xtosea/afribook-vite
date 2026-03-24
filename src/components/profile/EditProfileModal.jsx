import React from "react";

const EditProfileModal = ({
  editing,
  setEditing,
  formData,
  handleSave,
  handleInputChange,
  handleFileChange,
  uploading = false,
  uploadProgress = { profilePic: 0, coverPhoto: 0 },
  previewProfilePic,
  previewCoverPhoto,
}) => {
  if (!editing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        {/* Text Fields */}
        {["name","bio","intro","dob","phone","education","origin","maritalStatus","email"].map(field => (
          <input
            key={field}
            type={field==="dob"?"date":field==="email"?"email":"text"}
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={formData[field]}
            onChange={handleInputChange}
            className="border p-2 w-full mb-3"
          />
        ))}

        {/* Profile Picture */}
        <label className="block mb-2">Profile Picture:</label>
        {previewProfilePic && (
          <img
            src={previewProfilePic}
            alt="Profile Preview"
            className="w-24 h-24 object-cover rounded mb-2"
          />
        )}
        <input
          type="file"
          onChange={e => handleFileChange(e, "profilePic")}
          className="mb-1"
        />
        {uploadProgress.profilePic > 0 && (
          <div className="w-full bg-gray-200 h-2 rounded mb-3">
            <div
              className="bg-blue-500 h-2 rounded"
              style={{ width: `${uploadProgress.profilePic}%` }}
            />
          </div>
        )}

        {/* Cover Photo */}
        <label className="block mb-2">Cover Photo:</label>
        {previewCoverPhoto && (
          <img
            src={previewCoverPhoto}
            alt="Cover Preview"
            className="w-full h-32 object-cover rounded mb-2"
          />
        )}
        <input
          type="file"
          onChange={e => handleFileChange(e, "coverPhoto")}
          className="mb-1"
        />
        {uploadProgress.coverPhoto > 0 && (
          <div className="w-full bg-gray-200 h-2 rounded mb-3">
            <div
              className="bg-blue-500 h-2 rounded"
              style={{ width: `${uploadProgress.coverPhoto}%` }}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={() => setEditing(false)}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded text-white ${
              uploading ? "bg-blue-300" : "bg-blue-500"
            }`}
            onClick={handleSave}
            disabled={uploading}
          >
            {uploading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;