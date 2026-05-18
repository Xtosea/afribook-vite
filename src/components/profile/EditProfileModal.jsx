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

  const onSave = async () => {
    try {
      if (handleSave) {
        await handleSave();
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save profile");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">

      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold">
            Edit Profile
          </h2>

          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-2xl font-bold text-gray-500 hover:text-black"
          >
            ×
          </button>
        </div>

        {/* Text Fields */}
        {[
          "name",
          "bio",
          "intro",
          "dob",
          "phone",
          "education",
          "origin",
          "maritalStatus",
          "email",
        ].map((field) => (
          <div key={field} className="mb-4">

            <label className="block mb-1 font-medium capitalize">
              {field}
            </label>

            <input
              type={
                field === "dob"
                  ? "date"
                  : field === "email"
                  ? "email"
                  : "text"
              }
              name={field}
              value={formData?.[field] || ""}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-lg p-3 w-full outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        {/* Profile Picture */}
        <div className="mb-5">
          <label className="block mb-2 font-medium">
            Profile Picture
          </label>

          {previewProfilePic && (
            <img
              src={previewProfilePic}
              alt="Profile Preview"
              className="w-24 h-24 rounded-full object-cover border mb-3"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleFileChange(e, "profilePic")
            }
            className="w-full"
          />

          {uploadProgress?.profilePic > 0 && (
            <div className="w-full bg-gray-200 h-2 rounded mt-2">
              <div
                className="bg-blue-500 h-2 rounded"
                style={{
                  width: `${uploadProgress.profilePic}%`,
                }}
              />
            </div>
          )}
        </div>

        {/* Cover Photo */}
        <div className="mb-5">
          <label className="block mb-2 font-medium">
            Cover Photo
          </label>

          {previewCoverPhoto && (
            <img
              src={previewCoverPhoto}
              alt="Cover Preview"
              className="w-full h-32 rounded object-cover border mb-3"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleFileChange(e, "coverPhoto")
            }
            className="w-full"
          />

          {uploadProgress?.coverPhoto > 0 && (
            <div className="w-full bg-gray-200 h-2 rounded mt-2">
              <div
                className="bg-blue-500 h-2 rounded"
                style={{
                  width: `${uploadProgress.coverPhoto}%`,
                }}
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">

          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={uploading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 py-3 rounded-lg font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={uploading}
            className={`flex-1 py-3 rounded-lg font-semibold text-white ${
              uploading
                ? "bg-blue-300"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {uploading ? "Saving..." : "Save"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;