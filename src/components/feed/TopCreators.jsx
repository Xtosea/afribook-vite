import React from "react";

const creators = [
  {
    _id: 1,
    name: "Daddy P",
    followers: "12k",
  },
  {
    _id: 2,
    name: "UBGold",
    followers: "8k",
  },
  {
    _id: 3,
    name: "Goodnews",
    followers: "5k",
  },
];

const TopCreators = () => {
  return (
    <div className="flex gap-4 overflow-x-auto">
      {creators.map((creator) => (
        <div
          key={creator._id}
          className="min-w-[150px] border rounded-xl p-3"
        >
          <div className="font-semibold">
            {creator.name}
          </div>

          <div className="text-sm text-gray-500">
            {creator.followers} followers
          </div>

          <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded">
            Follow
          </button>
        </div>
      ))}
    </div>
  );
};

export default TopCreators;