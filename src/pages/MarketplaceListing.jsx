import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { fetchWithToken } from "../api/api";
import { useAuth } from "../context/AuthContext";

import ListingGallery from "../components/marketplace/ListingGallery";
import ListingInfo from "../components/marketplace/ListingInfo";
import SellerCard from "../components/marketplace/SellerCard";
import ContactButtons from "../components/marketplace/ContactButtons";
import OwnerActions from "../components/marketplace/OwnerActions";

export default function MarketplaceListing() {
  const navigate = useNavigate();
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

  const currentUserId = String(currentUser?._id || "");
  const sellerId = String(
    listing?.seller?._id || listing?.seller || ""
  );

  const isOwner =
    currentUserId !== "" &&
    sellerId !== "" &&
    currentUserId === sellerId;

  const isAdmin = currentUser?.role === "admin";
  const canManage = isOwner || isAdmin;

  const isSaved = Array.isArray(listing?.savedBy)
    ? listing.savedBy.some(
        (savedId) =>
          String(savedId) === String(currentUser?._id)
      )
    : false;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      await fetchWithToken(
        `/api/marketplace/${id}`,
        token,
        {
          method: "DELETE",
        }
      );

      alert("Listing deleted successfully.");
      navigate("/marketplace");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete listing.");
    }
  };

  const handleMarkSold = async () => {
    try {
      const res = await fetchWithToken(
        `/api/marketplace/${id}`,
        token,
        {
          method: "PUT",
          body: JSON.stringify({
            status: "Sold",
          }),
        }
      );

      setListing(res.listing);
      alert("Listing marked as sold.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to mark listing as sold.");
    }
  };

  const handlePromote = async () => {
    try {
      const res = await fetchWithToken(
        `/api/marketplace/${id}`,
        token,
        {
          method: "PUT",
          body: JSON.stringify({
            featured: true,
          }),
        }
      );

      setListing(res.listing);
      alert("Listing promoted successfully.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to promote listing.");
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetchWithToken(
        `/api/marketplace/${id}/save`,
        token,
        {
          method: "POST",
        }
      );

      setListing((prev) => ({
        ...prev,
        savedBy: res.saved
          ? [
              ...(prev.savedBy || []),
              currentUser._id,
            ]
          : (prev.savedBy || []).filter(
              (savedId) =>
                String(savedId) !==
                String(currentUser._id)
            ),
      }));
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save listing.");
    }
  };

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

          {canManage && (
            <OwnerActions
              listing={listing}
              onDelete={handleDelete}
              onMarkSold={handleMarkSold}
              onPromote={handlePromote}
            />
          )}

        </div>

        {/* Right */}
        <div className="space-y-6">

          <SellerCard listing={listing} />

          <button
            type="button"
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border hover:bg-gray-50"
          >
            {isSaved ? "Unsave Listing" : "Save Listing"}
          </button>

          <ContactButtons listing={listing} />

        </div>

      </div>

    </div>
  );
}