// src/components/profile/ProfileTabs.jsx
import React from "react";
import {
  FiGrid,
  FiUser,
  FiImage,
  FiUsers,
  FiVideo,
  FiFilm,
  FiHeart,
  FiUserCheck,
} from "react-icons/fi"; // Using react-icons for icons

const tabs = [
  { id: "Posts", label: "Posts", icon: <FiGrid /> },
  { id: "About", label: "About", icon: <FiUser /> },
  { id: "Photos", label: "Photos", icon: <FiImage /> },
  { id: "Friends", label: "Friends", icon: <FiUsers /> },
  { id: "Videos", label: "Videos", icon: <FiVideo /> },
  { id: "Reels", label: "Reels", icon: <FiFilm /> },
  { id: "Followers", label: "Followers", icon: <FiHeart /> },
  { id: "Following", label: "Following", icon: <FiUserCheck /> },
];

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="overflow-x-auto no-scrollbar py-2 border-b border-gray-200">
      <div className="flex space-x-4 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-1 whitespace-nowrap px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-blue-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileTabs;