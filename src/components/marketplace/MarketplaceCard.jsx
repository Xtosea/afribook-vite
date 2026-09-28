import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Bookmark,
  Eye,
  Flag,
  MapPin,
  Clock3,
  Megaphone,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { fetchWithToken } from "../../api/api";
import BoostModal from "../BoostModal";

const MarketplaceCard = ({ listing }) => {
  const { currentUser, token } = useAuth();
  const [showBoost, setShowBoost] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    Array.isArray(listing.likes)
      ? listing.likes.length
      : 0
  );
  const [saved, setSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(
    Array.isArray(listing.savedBy)
      ? listing.savedBy.length
      : 0
  );
  const [actionLoading, setActionLoading] = useState(false);

  const image =
    listing.images?.length
      ? listing.images[0].url
      : "https://placehold.co/600x600?text=No+Image";

  const price = Number(
    listing.price || 0
  ).toLocaleString();

  const currencySymbols = {
    NGN: "₦",
    GHS: "₵",
    KES: "KSh",
    ZAR: "R",
    USD: "$",
  };

  const currency =
    currencySymbols[listing.currency] ||
    listing.currency;

  const date = new Date(
    listing.createdAt
  ).toLocaleDateString();

  const location = [
    listing.location?.area,
    listing.location?.city,
    listing.location?.state,
    listing.location?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const currentUserId = String(
    currentUser?._id || ""
  );

  const sellerId = String(
    listing.seller?._id ||
      listing.seller ||
      ""
  );

  const isOwner =
    currentUserId !== "" &&
    sellerId !== "" &&
    currentUserId === sellerId;

  useEffect(() => {
    if (!currentUserId) {
      setLiked(false);
      setSaved(false);
      return;
    }

    const likes = Array.isArray(listing.likes)
      ? listing.likes
      : [];

    const savedBy = Array.isArray(listing.savedBy)
      ? listing.savedBy
      : [];

    setLiked(
      likes.some(
        (userId) =>
          String(userId) === currentUserId
      )
    );

    setSaved(
      savedBy.some(
        (userId) =>
          String(userId) === currentUserId
      )
    );

    setLikeCount(likes.length);
    setSaveCount(savedBy.length);
  }, [
    listing.likes,
    listing.savedBy,
    currentUserId,
  ]);

  const requireAuth = () => {
    if (!token || !currentUser) {
      alert("Please log in to perform this action.");
      return false;
    }

    return true;
  };

  const handleLike = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!requireAuth() || actionLoading) {
      return;
    }

    try {
      setActionLoading(true);

      const res = await fetchWithToken(
        `/api/marketplace/${listing._id}/like`,
        token,
        {
          method: "POST",
        }
      );

      setLiked(!!res.liked);
      setLikeCount(
        Number(
          res.likeCount ??
            res.likes?.length ??
            0
        )
      );
    } catch (err) {
      console.error("Marketplace like error:", err);
      alert(
        err.message ||
          "Failed to like listing."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!requireAuth() || actionLoading) {
      return;
    }

    try {
      setActionLoading(true);

      const res = await fetchWithToken(
        `/api/marketplace/${listing._id}/save`,
        token,
        {
          method: "POST",
        }
      );

      setSaved(!!res.saved);
      setSaveCount(
        Number(res.savedCount ?? 0)
      );
    } catch (err) {
      console.error("Marketplace save error:", err);
      alert(
        err.message ||
          "Failed to save listing."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReport = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!requireAuth() || actionLoading) {
      return;
    }

    const reason = window.prompt(
      "Why are you reporting this listing?"
    );

    if (!reason || !reason.trim()) {
      return;
    }

    try {
      setActionLoading(true);

      const res = await fetchWithToken(
        `/api/marketplace/${listing._id}/report`,
        token,
        {
          method: "POST",
          body: JSON.stringify({
            reason: reason.trim(),
          }),
        }
      );

      alert(
        res.message ||
          "Listing reported successfully."
      );
    } catch (err) {
      console.error(
        "Marketplace report error:",
        err
      );

      alert(
        err.message ||
          "Failed to report listing."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleBoost = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setShowBoost(true);
  };

  return (
    <>
      <article className="group bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition">
        {/* Listing Link */}
        <Link
          to={`/marketplace/${listing._id}`}
          className="block"
        >
          {/* Image */}
          <div className="relative">
            <img
              src={image}
              alt={listing.title}
              className="w-full h-60 object-cover group-hover:scale-105 transition duration-300"
            />

            {/* Condition */}
            <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
              {listing.condition}
            </span>

            {/* Sold */}
            {listing.status === "Sold" && (
              <span className="absolute top-3 right-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                SOLD
              </span>
            )}

            {/* Featured */}
            {listing.featured && (
              <span className="absolute bottom-3 left-3 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Price */}
            <div>
              <h2 className="text-xl font-bold text-blue-600">
                {currency}
                {price}
              </h2>

              {listing.negotiable && (
                <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Negotiable
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold line-clamp-2">
              {listing.title}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MapPin size={16} />
              <span>
                {location ||
                  "Location not specified"}
              </span>
            </div>

            {/* Seller */}
            <div className="flex items-center gap-3">
              <img
                src={
                  listing.seller?.profilePic ||
                  "https://ui-avatars.com/api/?name=User"
                }
                alt={
                  listing.seller?.name ||
                  "Seller"
                }
                className="w-10 h-10 rounded-full object-cover"
              />

              <div>
                <p className="font-medium">
                  {listing.seller?.name ||
                    "Unknown Seller"}
                </p>

                <p className="text-xs text-gray-500">
                  Seller
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* Actions */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between pt-3 border-t">
            {/* Like */}
            <button
              type="button"
              onClick={handleLike}
              disabled={actionLoading}
              className={`flex items-center gap-1 transition ${
                liked
                  ? "text-red-600"
                  : "text-gray-500 hover:text-red-600"
              }`}
              aria-label={
                liked
                  ? "Unlike listing"
                  : "Like listing"
              }
            >
              <Heart
                size={19}
                fill={liked ? "currentColor" : "none"}
              />
              <span>{likeCount}</span>
            </button>

            {/* Save */}
            <button
              type="button"
              onClick={handleSave}
              disabled={actionLoading}
              className={`flex items-center gap-1 transition ${
                saved
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-blue-600"
              }`}
              aria-label={
                saved
                  ? "Unsave listing"
                  : "Save listing"
              }
            >
              <Bookmark
                size={19}
                fill={saved ? "currentColor" : "none"}
              />
              <span>{saveCount}</span>
            </button>

            {/* Views */}
            <div
              className="flex items-center gap-1 text-gray-500"
              aria-label="Listing views"
            >
              <Eye size={19} />
              <span>{listing.views || 0}</span>
            </div>

            {/* Report */}
            <button
              type="button"
              onClick={handleReport}
              disabled={actionLoading}
              className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition"
              aria-label="Report listing"
            >
              <Flag size={19} />
            </button>

            {/* Date */}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock3 size={14} />
              <span>{date}</span>
            </div>
          </div>

          {/* Owner Boost Action */}
          {isOwner && (
            <button
              type="button"
              onClick={handleBoost}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              <Megaphone size={18} />
              Boost Listing
            </button>
          )}
        </div>
      </article>

      {/* Boost Modal */}
      {showBoost && (
        <BoostModal
          listing={listing}
          token={token}
          onClose={() => setShowBoost(false)}
        />
      )}
    </>
  );
};

export default MarketplaceCard;
