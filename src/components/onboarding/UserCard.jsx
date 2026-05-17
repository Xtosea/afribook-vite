import React from "react";
import { useNavigate } from "react-router-dom";

const defaultProfile =
  "https://afribook-backend.onrender.com/uploads/profiles/default-profile.png";

const UserCard = ({
  user,
  status,
  onAddFriend,
}) => {

  const navigate = useNavigate();

  return (

    <div className="
      flex
      items-center
      justify-between
      bg-white
      p-3
      rounded-2xl
      shadow-sm
      border
    ">

      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate(`/profile/${user._id}`)}
      >

        <img
          src={user?.profilePic || defaultProfile}
          onError={(e) => {
            e.target.src = defaultProfile;
          }}
          alt="profile"
          className="w-14 h-14 rounded-full object-cover"
        />

        <div>

          <h3 className="font-semibold">
            {user?.name || "User"}
          </h3>

          <p className="text-sm text-gray-500">
            Suggested for you
          </p>

        </div>

      </div>

      <button
        onClick={onAddFriend}
        disabled={status === "pending"}
        className={`
          px-4
          py-2
          rounded-xl
          text-white
          text-sm
          font-medium
          transition
          ${
            status === "pending"
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }
        `}
      >

        {status === "pending"
          ? "Pending"
          : "Add Friend"}

      </button>

    </div>

  );

};

export default UserCard;