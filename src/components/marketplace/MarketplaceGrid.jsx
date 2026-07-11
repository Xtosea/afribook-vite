import React from "react";

import {
  PackageOpen,
} from "lucide-react";

import MarketplaceCard from "./MarketplaceCard";

const MarketplaceGrid = ({
  listings = [],
  loading = false,
}) => {

  // ===============================
  // Loading Skeleton
  // ===============================

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border overflow-hidden animate-pulse"
          >
            <div className="h-60 bg-gray-200" />

            <div className="p-4 space-y-3">

              <div className="h-5 bg-gray-200 rounded w-2/3" />

              <div className="h-4 bg-gray-200 rounded" />

              <div className="h-4 bg-gray-200 rounded w-3/4" />

              <div className="flex items-center gap-3 pt-3">

                <div className="w-10 h-10 rounded-full bg-gray-200" />

                <div className="flex-1">

                  <div className="h-4 bg-gray-200 rounded w-24 mb-2" />

                  <div className="h-3 bg-gray-200 rounded w-16" />

                </div>

              </div>

            </div>

          </div>
        ))}

      </div>
    );
  }

  // ===============================
  // Empty State
  // ===============================

  if (!listings.length) {
    return (
      <div className="bg-white rounded-2xl border p-12 text-center">

        <PackageOpen
          size={70}
          className="mx-auto text-gray-300"
        />

        <h2 className="mt-5 text-2xl font-bold">

          No Listings Found

        </h2>

        <p className="text-gray-500 mt-2">

          Try another category or search term.

        </p>

      </div>
    );
  }

  // ===============================
  // Marketplace Cards
  // ===============================



  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

      {listings.map((listing) => (
        <MarketplaceCard
          key={listing._id}
          listing={listing}
        />
      ))}

    </div>
  );
};

export default MarketplaceGrid;