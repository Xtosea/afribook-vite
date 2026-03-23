import React from "react";

const tabs = ["Posts", "About", "Photos"];

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-white rounded-xl shadow flex">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 py-2 text-center ${
            activeTab === tab
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;