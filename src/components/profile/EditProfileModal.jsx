import React from "react";

const EditProfileModal = ({
  editing,
  setEditing,
  formData,
  handleSave,
  handleInputChange,
  handleFileChange,
  uploading,
  uploadProgress,
  previewProfilePic,
  previewCoverPhoto,
}) => {
  if (!editing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-5 rounded w-96">
        <h2>Edit Profile</h2>

        <input name="name" value={formData.name} onChange={handleInputChange} />

        <label>Profile Pic</label>
        {previewProfilePic && <img src={previewProfilePic} width="80" />}
        <input type="file" accept="image/*" onChange={(e)=>handleFileChange(e,"profilePic")} />

        <label>Cover</label>
        {previewCoverPhoto && <img src={previewCoverPhoto} width="100%" />}
        <input type="file" accept="image/*" onChange={(e)=>handleFileChange(e,"coverPhoto")} />

        <button onClick={handleSave}>
          {uploading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default EditProfileModal;