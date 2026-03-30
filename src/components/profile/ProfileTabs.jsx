// src/components/profile/ProfileTabs.jsx
import React from "react";
import { Users, Image, Video, FileText, Heart } from "lucide-react";

const tabs = [
  { key: "Posts", label: "Posts", icon: FileText },
  { key: "About", label: "About", icon: FileText },
  { key: "Photos", label: "Photos", icon: Image },
  { key: "Friends", label: "Friends", icon: Users },
  { key: "Videos", label: "Videos", icon: Video },
  { key: "Reels", label: "Reels", icon: Video },
  { key: "Followers", label: "Followers", icon: Users },
  { key: "Following", label: "Following", icon: Users },
];

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="overflow-x-auto no-scrollbar py-2">
      <div className="flex gap-4 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg transition ${
                isActive ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileTabs;