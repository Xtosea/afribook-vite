import React from "react";

const UserCard = ({ user, onAddFriend, status }) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg mb-2">
      <div className="flex items-center gap-3">
        <img
          src={user.profilePic || "/default-avatar.png"}
          alt={user.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <span className="font-semibold">{user.name}</span>
          {user.source && <span className="text-xs text-gray-400 ml-1">({user.source})</span>}
        </div>
      </div>
      <button
        onClick={() => onAddFriend(user._id)}
        className={`px-3 py-1 rounded ${
          status === "pending" ? "bg-gray-300 text-gray-700" : "bg-blue-500 text-white"
        }`}
        disabled={status === "pending"}
      >
        {status === "pending" ? "Pending" : "Add Friend"}
      </button>
    </div>
  );
};

export default UserCard;