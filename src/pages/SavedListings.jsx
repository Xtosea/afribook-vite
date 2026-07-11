// src/pages/SavedListings.jsx

import React, {
  useEffect,
  useState,
} from "react";

import { fetchWithToken } from "../api/api";
import { useAuth } from "../context/AuthContext";

import MarketplaceCard from "../components/marketplace/MarketplaceCard";

export default function SavedListings() {
  const { token } = useAuth();

  const [listings, setListings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadSavedListings();
  }, []);

  const loadSavedListings = async () => {
    try {
      setLoading(true);

      const res =
        await fetchWithToken(
          "/api/marketplace/saved",
          token
        );

      setListings(
        res.listings || []
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-5">

        <h1 className="text-3xl font-bold mb-6">
          Saved Listings
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {Array.from({
            length: 6,
          }).map((_, i) => (
            <div
              key={i}
              className="h-96 bg-gray-200 rounded-2xl animate-pulse"
            />
          ))}

        </div>

      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-5">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Saved Listings
        </h1>

        <span className="text-gray-500">
          {listings.length} saved
        </span>

      </div>

      {listings.length === 0 ? (
        <div className="text-center py-24">

          <div className="text-6xl mb-4">
            ❤️
          </div>

          <h2 className="text-2xl font-semibold mb-2">
            No saved listings yet
          </h2>

          <p className="text-gray-500">
            Save products you like to
            find them quickly later.
          </p>

        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {listings.map(
            (listing) => (
              <MarketplaceCard
                key={listing._id}
                listing={listing}
              />
            )
          )}

        </div>
      )}

    </div>
  );
}