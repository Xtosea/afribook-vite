import React from "react";
import { Link } from "react-router-dom";

import {
  Heart,
  Bookmark,
  Eye,
  MapPin,
  Clock3,
} from "lucide-react";

const MarketplaceCard = ({ listing }) => {
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

  return (
    <Link
      to={`/marketplace/${listing._id}`}
      className="group bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition"
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
            {location || "Location not specified"}
          </span>
        </div>

        {/* Seller */}

        <div className="flex items-center gap-3">
          <img
            src={
              listing.seller?.profilePic ||
              "https://ui-avatars.com/api/?name=User"
            }
            alt={listing.seller?.name || "Seller"}
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

        {/* Footer */}

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex gap-4 text-gray-500">
            <div className="flex items-center gap-1">
              <Heart size={18} />

              <span>
                {listing.likes?.length || 0}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Bookmark size={18} />

              <span>
                {listing.savedBy?.length || 0}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Eye size={18} />

              <span>
                {listing.views || 0}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock3 size={14} />

            <span>{date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MarketplaceCard;