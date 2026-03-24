// src/components/profile/UserInfoCard.jsx
import React, { useState } from "react";

const UserInfoCard = ({ user, editable = false, formData, setFormData, handleSave }) => {
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSave = async () => {
    if (!handleSave) return;
    try {
      setSaving(true);
      await handleSave();
    } catch (err) {
      console.error("Failed to save About info:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-3">
      <h2 className="text-lg font-bold mb-2">About</h2>

      <div className="space-y-2">
        <div>
          <strong>📖 Intro: </strong>
          {editable ? (
            <input
              type="text"
              name="intro"
              value={formData.intro}
              onChange={handleInputChange}
              className="border p-1 rounded w-full"
            />
          ) : (
            user.intro || "-"
          )}
        </div>

        <div>
          <strong>🎂 DOB: </strong>
          {editable ? (
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className="border p-1 rounded w-full"
            />
          ) : (
            user.dob || "-"
          )}
        </div>

        <div>
          <strong>📞 Phone: </strong>
          {editable ? (
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="border p-1 rounded w-full"
            />
          ) : (
            user.phone || "-"
          )}
        </div>

        <div>
          <strong>🎓 Education: </strong>
          {editable ? (
            <input
              type="text"
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              className="border p-1 rounded w-full"
            />
          ) : (
            user.education || "-"
          )}
        </div>

        <div>
          <strong>🌍 Origin: </strong>
          {editable ? (
            <input
              type="text"
              name="origin"
              value={formData.origin}
              onChange={handleInputChange}
              className="border p-1 rounded w-full"
            />
          ) : (
            user.origin || "-"
          )}
        </div>

        <div>
          <strong>💍 Status: </strong>
          {editable ? (
            <input
              type="text"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleInputChange}
              className="border p-1 rounded w-full"
            />
          ) : (
            user.maritalStatus || "-"
          )}
        </div>

        <div>
          <strong>🧑‍🤝‍🧑 Spouse: </strong>
          {editable ? (
            <input
              type="text"
              name="spouse"
              value={formData.spouse}
              onChange={handleInputChange}
              className="border p-1 rounded w-full"
            />
          ) : (
            user.spouse || "-"
          )}
        </div>

        <div>
          <strong>⚧ Gender: </strong>
          {editable ? (
            <input
              type="text"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="border p-1 rounded w-full"
            />
          ) : (
            user.gender || "-"
          )}
        </div>

        <div>
          <strong>📧 Email: </strong>
          {editable ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="border p-1 rounded w-full"
            />
          ) : (
            user.email || "-"
          )}
        </div>
      </div>

      {editable && (
        <div className="flex justify-end mt-4">
          <button
            onClick={onSave}
            disabled={saving}
            className={`px-4 py-2 rounded text-white ${
              saving ? "bg-blue-300" : "bg-blue-500"
            }`}
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
      )}
    </div>
  );
};

export default UserInfoCard;