import React from "react";

const AIMediaStudio = () => {
  return (
    <div className="w-full bg-gray-100">
      <iframe
        src="https://aimediastudio.globelynks.com"
        title="AI Media Studio"
        className="w-full border-0"
        style={{
          height: "calc(100vh - 80px)",
          minHeight: "700px",
        }}
        allow="microphone; camera; autoplay; fullscreen"
      />
    </div>
  );
};

export default AIMediaStudio;
