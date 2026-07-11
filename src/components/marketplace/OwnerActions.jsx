import React from "react";
import { Link } from "react-router-dom";

import {
  Pencil,
  Trash2,
  CheckCircle,
  Share2,
  Star,
} from "lucide-react";

export default function OwnerActions({
  listing,
  onDelete,
  onMarkSold,
  onPromote,
}) {
  return (
    <div className="bg-white rounded-2xl border p-5 space-y-4">

      <h2 className="text-lg font-semibold">
        Manage Listing
      </h2>

      <Link
        to={`/marketplace/${listing._id}/edit`}
        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50"
      >
        <Pencil size={20} />
        Edit Listing
      </Link>

      <button
        onClick={onMarkSold}
        className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50"
      >
        <CheckCircle size={20} />
        Mark as Sold
      </button>

      <button
        onClick={onPromote}
        className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50"
      >
        <Star size={20} />
        Promote Listing
      </button>

      <button
        onClick={() =>
          navigator.share
            ? navigator.share({
                title: listing.title,
                url: window.location.href,
              })
            : navigator.clipboard.writeText(
                window.location.href
              )
        }
        className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50"
      >
        <Share2 size={20} />
        Share Listing
      </button>

      <button
        onClick={onDelete}
        className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-600 text-white hover:bg-red-700"
      >
        <Trash2 size={20} />
        Delete Listing
      </button>

    </div>
  );
}