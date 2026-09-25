import React from "react";

const EditProfileModal = ({
  editing,
  setEditing,
  formData,
  handleSave,
  handleInputChange,
  uploading = false,
}) => {
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

  if (!editing) return null;

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
