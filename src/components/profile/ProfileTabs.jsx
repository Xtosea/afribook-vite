// src/components/profile/ProfileTabs.jsx
import React from "react";
import {
  Image,
  User,
  Users,
  Video,
  Film,
  FileText,
  UserPlus
} from "lucide-react";

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { name: "Posts", icon: <FileText size={16}/> },
    { name: "About", icon: <User size={16}/> },
    { name: "Photos", icon: <Image size={16}/> },
    { name: "Friends", icon: <Users size={16}/> },
    { name: "Followers", icon: <UserPlus size={16}/> },
    { name: "Following", icon: <UserPlus size={16}/> },
    { name: "Videos", icon: <Video size={16}/> },
    { name: "Reels", icon: <Film size={16}/> },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex gap-2 overflow-x-auto px-2 border-b">

        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`
              flex items-center gap-2
              px-4 py-3 text-sm font-medium whitespace-nowrap
              transition-all duration-200
              ${
                activeTab === tab.name
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }
            `}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}

      </div>
    </div>
  );
};

export default ProfileTabs;