// src/components/profile/ProfileTabs.jsx
import React from "react";

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    "Posts",
    "About",
    "Photos",
    "Friends",
    "Videos",
    "Reels",
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex gap-2 overflow-x-auto px-2 border-b">

        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-4 py-3 text-sm font-medium whitespace-nowrap
              transition-all duration-200
              ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }
            `}
          >
            {tab}
          </button>
        ))}

      </div>
    </div>
  );
};

export default ProfileTabs;