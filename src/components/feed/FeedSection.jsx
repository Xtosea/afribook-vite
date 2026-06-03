import React from "react";

const FeedSection = ({
  title,
  children,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4">
      <h2 className="font-bold text-lg mb-3">
        {title}
      </h2>

      {children}
    </div>
  );
};

export default FeedSection;