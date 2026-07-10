import React from "react";

import {
  MapPin,
  Package,
  Tag,
  Truck,
  BadgeCheck,
} from "lucide-react";

export default function ListingInfo({
  listing,
}) {
  if (!listing) return null;

  const {
    title,
    description,
    price,
    currency,
    negotiable,
    category,
    brand,
    model,
    quantity,
    condition,
    deliveryAvailable,
    deliveryFee,
    location = {},
  } = listing;

  return (
    <div className="space-y-6">

      {/* Title */}

      <div>
        <h1 className="text-3xl font-bold">
          {title}
        </h1>

        <div className="flex items-center gap-3 mt-3 flex-wrap">

          <span className="text-3xl font-bold text-green-700">
            {currency} {Number(price).toLocaleString()}
          </span>

          {negotiable && (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              Negotiable
            </span>
          )}

        </div>
      </div>

      {/* Details */}

      <div className="grid md:grid-cols-2 gap-4">

        <div className="flex items-center gap-2">
          <Tag size={18} />
          <span>
            <strong>Category:</strong> {category}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <BadgeCheck size={18} />
          <span>
            <strong>Condition:</strong> {condition}
          </span>
        </div>

        {brand && (
          <div className="flex items-center gap-2">
            <Package size={18} />
            <span>
              <strong>Brand:</strong> {brand}
            </span>
          </div>
        )}

        {model && (
          <div className="flex items-center gap-2">
            <Package size={18} />
            <span>
              <strong>Model:</strong> {model}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Package size={18} />
          <span>
            <strong>Quantity:</strong> {quantity}
          </span>
        </div>

      </div>

      {/* Location */}

      <div className="border rounded-xl p-4">

        <h2 className="font-semibold mb-3">
          Location
        </h2>

        <div className="flex items-start gap-2">

          <MapPin size={20} />

          <div>
            <p>{location.area}</p>
            <p>{location.city}</p>

            {location.lga && (
              <p>{location.lga}</p>
            )}

            <p>{location.state}</p>
            <p>{location.country}</p>
          </div>

        </div>

      </div>

      {/* Delivery */}

      <div className="border rounded-xl p-4">

        <div className="flex items-center gap-2 mb-2">

          <Truck size={20} />

          <h2 className="font-semibold">
            Delivery
          </h2>

        </div>

        {deliveryAvailable ? (
          <div className="space-y-1">

            <p className="text-green-700">
              Delivery Available
            </p>

            <p>
              Delivery Fee:{" "}
              {currency}{" "}
              {Number(deliveryFee).toLocaleString()}
            </p>

          </div>
        ) : (
          <p className="text-gray-500">
            Delivery not available.
          </p>
        )}

      </div>

      {/* Description */}

      <div className="border rounded-xl p-4">

        <h2 className="font-semibold mb-3">
          Description
        </h2>

        <p className="leading-7 whitespace-pre-wrap">
          {description}
        </p>

      </div>

    </div>
  );
}