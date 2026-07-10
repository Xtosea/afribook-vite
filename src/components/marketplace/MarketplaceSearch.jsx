import React from "react";
import {
  Search,
  X,
} from "lucide-react";

const MarketplaceSearch = ({
  value,
  onChange,
  placeholder = "Search for products...",
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6">

      <div className="relative">

        {/* Search Icon */}
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        {/* Search Input */}
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border rounded-xl pl-12 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
          >
            <X size={20} />
          </button>
        )}

      </div>

    </div>
  );
};

export default MarketplaceSearch;