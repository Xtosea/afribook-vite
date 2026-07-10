import React from "react";
import { Link } from "react-router-dom";

import {
  User,
  Phone,
  MessageCircle,
  MapPin,
} from "lucide-react";

export default function SellerCard({
  listing,
}) {
  if (!listing) return null;

  const {
    seller = {},
    phone,
    whatsapp,
    location = {},
    hidePhone,
  } = listing;

  const profileImage =
    seller.profilePic ||
    "https://via.placeholder.com/120?text=User";

  const whatsappNumber =
    whatsapp || phone;

  return (
    <div className="border rounded-2xl p-5 bg-white shadow-sm space-y-5">

      <h2 className="text-lg font-semibold">
        Seller Information
      </h2>

      {/* Seller */}

      <div className="flex items-center gap-4">

        <img
          src={profileImage}
          alt={seller.name}
          className="w-16 h-16 rounded-full object-cover border"
        />

        <div>

          <h3 className="font-semibold text-lg">
            {seller.name || "Unknown Seller"}
          </h3>

          {seller.email && (
            <p className="text-sm text-gray-500">
              {seller.email}
            </p>
          )}

        </div>

      </div>

      {/* Seller Profile */}

      {seller._id && (
        <Link
          to={`/profile/${seller._id}`}
          className="flex items-center justify-center gap-2 w-full border rounded-lg py-3 hover:bg-gray-100 transition"
        >
          <User size={18} />

          View Seller Profile
        </Link>
      )}

      {/* Location */}

      <div className="flex items-start gap-2">

        <MapPin
          size={18}
          className="mt-1"
        />

        <div className="text-sm">

          <p>{location.city}</p>

          <p>{location.state}</p>

          <p>{location.country}</p>

        </div>

      </div>

      {/* Phone */}

      {!hidePhone && phone && (
        <a
          href={`tel:${phone}`}
          className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700"
        >
          <Phone size={18} />

          Call Seller
        </a>
      )}

      {/* WhatsApp */}

      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-green-600 text-white rounded-lg py-3 hover:bg-green-700"
        >
          <MessageCircle size={18} />

          Chat on WhatsApp
        </a>
      )}

    </div>
  );
}