import React, { useEffect, useState } from "react";
import { API_BASE } from "../../api/api";

const TopEarners = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/users/top-earners?limit=5`
        );

        const data = await res.json();

        setUsers(data.users || []);
      } catch (err) {
        console.log(err);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-3">
      {users.map((user, index) => (
        <div
          key={user._id}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="font-bold">
              #{index + 1}
            </span>

            <img
              src={
                user.profilePic ||
                "/default-avatar.png"
              }
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />

            <div>
              <p className="font-semibold">
                {user.name}
              </p>

              <p className="text-xs text-gray-500">
                @{user.username}
              </p>
            </div>
          </div>

          <span className="font-bold text-green-600">
            ₦{user.totalEarned}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TopEarners;