import React from "react";
import { API_BASE } from "../../api/api";

const SidebarLeft = ({ user }) => {
  const safeUser = user && typeof user === "object" && !user.$$typeof ? user : {};

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-4">

      {/* USER */}
      <div className="flex items-center gap-3">
        <img
          src={safeUser.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`}
          className="w-10 h-10 rounded-full"
        />
        <span className="font-semibold">{safeUser.name || "User"}</span>
      </div>

      {/* MENU */}
      <div className="space-y-2 text-sm">
        <p className="cursor-pointer hover:text-blue-500">🏠 Home</p>
        <p className="cursor-pointer hover:text-blue-500">👥 Friends</p>
        <p className="cursor-pointer hover:text-blue-500">📺 Videos</p>
        <p className="cursor-pointer hover:text-blue-500">🏆 Leaderboard</p>
      </div>

    </div>
  );
};

export default SidebarLeft;