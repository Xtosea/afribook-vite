import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Heart,
  Share2,
  MessageCircle,
  Flag,
} from "lucide-react";

export default function ContactButtons({
  listing,
}) {
  const navigate = useNavigate();

  if (!listing) return null;

  const shareListing = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: listing.title,
          text: listing.description,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Listing link copied.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const messageSeller = () => {
    if (!listing.seller?._id) return;

    navigate(`/messages/${listing.seller._id}`);
  };

  const saveListing = () => {
    // We'll connect this to the backend later.
    alert("Save feature coming soon.");
  };

  const reportListing = () => {
    // We'll connect this to the backend later.
    alert("Report feature coming soon.");
  };

  return (
    <div className="grid grid-cols-2 gap-3">

      <button
        onClick={saveListing}
        className="flex items-center justify-center gap-2 border rounded-xl py-3 hover:bg-gray-100"
      >
        <Heart size={20} />
        Save
      </button>

      <button
        onClick={shareListing}
        className="flex items-center justify-center gap-2 border rounded-xl py-3 hover:bg-gray-100"
      >
        <Share2 size={20} />
        Share
      </button>

      <button
        onClick={messageSeller}
        className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-3 hover:bg-blue-700"
      >
        <MessageCircle size={20} />
        Message
      </button>

      <button
        onClick={reportListing}
        className="flex items-center justify-center gap-2 bg-red-600 text-white rounded-xl py-3 hover:bg-red-700"
      >
        <Flag size={20} />
        Report
      </button>

    </div>
  );
}