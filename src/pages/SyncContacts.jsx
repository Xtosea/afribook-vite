import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SyncContacts() {
  const [contacts, setContacts] = useState([]);
  const navigate = useNavigate();

  const handleSync = async () => {
    // Example: Fetch contacts from backend
    const synced = await fetch("/api/users/sync-contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contacts: ["+2348001234567"] }),
    }).then(res => res.json());

    setContacts(synced);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Sync Contacts</h1>
      <p className="mb-4 text-gray-600">
        Find friends from your phone contacts who are already on Afribook.
      </p>

      <button
        onClick={handleSync}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Sync My Contacts
      </button>

      <ul className="mt-4 space-y-2">
        {contacts.map(u => (
          <li key={u._id} className="flex justify-between items-center border p-2 rounded">
            <span>{u.name}</span>
            <button className="text-blue-600" onClick={() => alert("Friend added!")}>
              Add Friend
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between">
        <button onClick={() => navigate("/add-friends")} className="underline text-gray-600">
          Back
        </button>
        <button onClick={() => navigate("/edit-profile")} className="bg-blue-500 text-white px-4 py-2 rounded">
          Next: Edit Profile
        </button>
      </div>
    </div>
  );
}