import React, { useState } from "react";
import { API_BASE } from "../api/api";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const searchUsers = async (q) => {
    try {
      setQuery(q);

      if (!q) {
        setUsers([]);
        return;
      }

      const res = await fetch(`${API_BASE}/api/search?q=${q}`);
      const data = await res.json();

      setUsers(data);

    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <div className="relative w-full max-w-md">

      <input
        type="text"
        placeholder="Search users..."
        className="w-full p-2 border rounded"
        value={query}
        onChange={(e) => searchUsers(e.target.value)}
      />

      {users.length > 0 && (
        <div className="absolute bg-white shadow w-full mt-1 rounded z-50">

          {users.map((user) => (
            <div
              key={user._id}
              className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              onClick={() => navigate(`/profile/${user._id}`)}
            >
              <img
                src={user.profilePic}
                alt=""
                className="w-8 h-8 rounded-full"
              />

              <span>{user.name}</span>

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default SearchBar;