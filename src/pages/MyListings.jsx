// src/pages/MyListings.jsx

import React, {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { fetchWithToken } from "../api/api";
import { useAuth } from "../context/AuthContext";

import MarketplaceGrid from "../components/marketplace/MarketplaceGrid";

export default function MyListings() {
  const { token } = useAuth();

  const [listings, setListings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);

      const res = await fetchWithToken(
        "/api/marketplace/me",
        token
      );

      setListings(res.listings || []);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to load your listings."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          My Listings
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center">
        <p className="text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          My Listings
        </h1>

        <Link
          to="/marketplace/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Create Listing
        </Link>

      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">

          <h2 className="text-xl font-semibold mb-3">
            You haven't created any listings yet.
          </h2>

          <Link
            to="/marketplace/create"
            className="inline-block mt-3 bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Create Your First Listing
          </Link>

        </div>
      ) : (
        <MarketplaceGrid
          listings={listings}
          loading={false}
        />
      )}
    </div>
  );
}