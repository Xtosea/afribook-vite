import React, { useEffect, useState } from "react";
import { fetchWithToken, API_BASE } from "../../api/api";

const SidebarRight = ({ token }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!token) return;

    const fetchUsers = async () => {
      try {
        const data = await fetchWithToken(`${API_BASE}/api/users`, token);
        setUsers(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch (err) {
        console.error(err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [token]);

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-3">
      <h3 className="font-semibold">People You May Know</h3>

      {users.map(user => {
        const safeUser = user && typeof user === "object" && !user.$$typeof ? user : {};
        return (
          <div key={safeUser._id || Math.random()} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={safeUser.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm">{safeUser.name || "Unknown"}</span>
            </div>

            <button className="text-blue-500 text-sm">Add</button>
          </div>
        );
      })}
    </div>
  );
};

export default SidebarRight;