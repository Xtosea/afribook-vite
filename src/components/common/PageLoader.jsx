import React from "react";

export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="w-14 h-14 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>

      <p className="mt-4 text-gray-600 font-medium">
        Loading Afribook...
      </p>
    </div>
  );
}