import React from "react";

const ChallengesWidget = () => {
  return (
    <div className="space-y-3">

      <div className="border rounded-xl p-3">
        <h3 className="font-semibold">
          Watch 5 Reels
        </h3>

        <p className="text-sm text-gray-500">
          Reward: 50 points
        </p>
      </div>

      <div className="border rounded-xl p-3">
        <h3 className="font-semibold">
          Like 10 Posts
        </h3>

        <p className="text-sm text-gray-500">
          Reward: 30 points
        </p>
      </div>

    </div>
  );
};

export default ChallengesWidget;