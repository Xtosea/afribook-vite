import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SyncContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSync = async () => {
  try {

    // TEMP SAMPLE CONTACTS
    const sampleContacts = [
      {
        name: "John Doe",
        phone: "08012345678",
      },
      {
        name: "Jane Doe",
        phone: "08099999999",
      },
    ];

    const res = await fetch(
  `${import.meta.env.VITE_API_BASE}/api/contacts/sync`,
  {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },

    body: JSON.stringify({
      contacts: sampleContacts,
    }),
  }
);

    if (!res.ok) {
      throw new Error("Failed to sync contacts");
    }

    const data = await res.json();

    setContacts(data.matchedUsers || []);

  } catch (err) {

    console.error(err);

  }
};
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Sync Contacts</h1>

      <p className="mb-4 text-gray-600">
        Find friends from your phone contacts who are already on AfricSocial.
      </p>

      <button
        onClick={handleSync}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Syncing..." : "Sync My Contacts"}
      </button>

      <ul className="mt-4 space-y-2">
        {contacts.map((u) => (
          <li
            key={u._id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <span>{u.name}</span>

            <button
              className="text-blue-600"
              onClick={() => alert("Friend request sent!")}
            >
              Add Friend
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => navigate("/add-friends")}
          className="underline text-gray-600"
        >
          Back
        </button>

        <button
          onClick={() => navigate("/edit-profile")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}