import React from "react";

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  const tabs = ["Posts", "About", "Photos"];

  return (
    <div className="bg-white rounded-xl shadow p-2 flex gap-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === tab
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-100"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;