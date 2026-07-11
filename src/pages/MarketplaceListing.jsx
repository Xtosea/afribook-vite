import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { fetchWithToken } from "../api/api";
import { useAuth } from "../context/AuthContext";

import ListingGallery from "../components/marketplace/ListingGallery";
import ListingInfo from "../components/marketplace/ListingInfo";
import SellerCard from "../components/marketplace/SellerCard";
import ContactButtons from "../components/marketplace/ContactButtons";
import OwnerActions from "../components/marketplace/OwnerActions";

export default function MarketplaceListing() {
  const { id } = useParams();

  const { token, currentUser } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetchWithToken(
        `/api/marketplace/${id}`,
        token
      );

      setListing(res.listing);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load listing.");
    } finally {
      setLoading(false);
    }
  };

  const isOwner =
  currentUser?._id === listing?.seller?._id;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="bg-gray-200 h-96 rounded-2xl"></div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-200 h-10 rounded"></div>
              <div className="bg-gray-200 h-6 rounded w-1/2"></div>
              <div className="bg-gray-200 h-40 rounded"></div>
            </div>

            <div className="bg-gray-200 h-80 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">
          {error}
        </h2>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold">
          Listing not found.
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Left */}
        <div className="lg:col-span-2 space-y-8">

          <ListingGallery
            images={listing.images}
            title={listing.title}
          />

          <ListingInfo listing={listing} />

          {isOwner && (
            <OwnerActions listing={listing} />
          )}

        </div>

        {/* Right */}
        <div className="space-y-6">

          <SellerCard listing={listing} />

          <ContactButtons listing={listing} />

        </div>

      </div>

    </div>
  );
}