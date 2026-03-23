import React from "react";

const ChatSidebar = ({ onSelectUser }) => {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  return (
    <div className="w-1/3 bg-white border-r overflow-y-auto">
      <h2 className="p-4 font-bold text-lg">Chats</h2>

      {users.map((user) => (
        <div
          key={user._id}
          onClick={() => onSelectUser(user)}
          className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
        >
          <img
            src={user.profilePic}
            className="w-10 h-10 rounded-full"
          />
          <span>{user.name}</span>
        </div>
      ))}
    </div>
  );
};

export default ChatSidebar;