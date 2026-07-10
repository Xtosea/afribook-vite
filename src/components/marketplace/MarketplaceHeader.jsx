import React from "react";
import { Link } from "react-router-dom";
import {
  Store,
  Plus,
  Package,
} from "lucide-react";

const MarketplaceHeader = ({
  total = 0,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

        {/* Left */}

        <div className="flex items-center gap-4">

          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
            <Store
              size={34}
              className="text-blue-600"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold">
              Marketplace
            </h1>

            <p className="text-gray-500 mt-1">
              Buy and sell items safely within
              the AfricSocial community.
            </p>

            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
              <Package size={16} />

              <span>
                {total} Active Listings
              </span>
            </div>
          </div>

        </div>

        {/* Right */}

        <Link
          to="/marketplace/create"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          <Plus size={20} />

          Sell Item
        </Link>

      </div>

    </div>
  );
};

export default MarketplaceHeader;