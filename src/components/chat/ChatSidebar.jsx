import React from "react";
import { API_BASE } from "../../api/api";

const ChatSidebar = ({ onSelectUser }) => {
  const usersRaw = localStorage.getItem("users");
  const users = Array.isArray(JSON.parse(usersRaw || "[]")) ? JSON.parse(usersRaw || "[]") : [];

  return (
    <div className="w-1/3 bg-white border-r overflow-y-auto">
      <h2 className="p-4 font-bold text-lg">Chats</h2>

      {users.map((user) => {
        const safeUser = user && typeof user === "object" && !user.$$typeof ? user : {};
        return (
          <div
            key={safeUser._id || Math.random()}
            onClick={() => onSelectUser && onSelectUser(safeUser)}
            className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
          >
            <img
              src={safeUser.profilePic || `${API_BASE}/uploads/profiles/default-profile.png`}
              className="w-10 h-10 rounded-full"
            />
            <span>{safeUser.name || "Unknown"}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ChatSidebar;