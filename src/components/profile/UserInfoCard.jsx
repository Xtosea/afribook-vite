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
      setSaving(false);
    } catch (err) {
      console.error("Failed to save About info:", err);
      setSaving(false);
    }
  };

  const fields = [
    { label: "📖 Intro", name: "intro", type: "text" },
    { label: "🎂 DOB", name: "dob", type: "date" },
    { label: "📞 Phone", name: "phone", type: "text" },
    { label: "🎓 Education", name: "education", type: "text" },
    { label: "🌍 Origin", name: "origin", type: "text" },
    { label: "💍 Status", name: "maritalStatus", type: "text" },
    { label: "👫 Spouse", name: "spouse", type: "text" },
    { label: "⚧ Gender", name: "gender", type: "text" },
    { label: "📧 Email", name: "email", type: "email" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-3">
      <h2 className="text-lg font-bold mb-2">About</h2>

      <div className="space-y-2">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label className="font-semibold">{field.label}:</label>
            {editable ? (
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleInputChange}
                className="border p-1 rounded w-full"
              />
            ) : (
              <span>{user[field.name] || "-"}</span>
            )}
          </div>
        ))}
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