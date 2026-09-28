import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchWithToken } from "../api/api";
import { useAuth } from "../context/AuthContext";

import ListingForm from "../components/marketplace/ListingForm";

export default function CreateListing() {
  const navigate = useNavigate();

  const { token, currentUser } = useAuth();

  const [loading, setLoading] =
    useState(false);

  const [premiumLoading, setPremiumLoading] =
    useState(true);

  const [isPremium, setIsPremium] =
    useState(false);

  const isAdmin =
    currentUser?.role === "admin";

  useEffect(() => {
    let cancelled = false;

    const loadPremiumStatus = async () => {
      if (!token || isAdmin) {
        setPremiumLoading(false);
        return;
      }

      try {
        const response = await fetchWithToken(
          "/api/premium/status",
          token
        );

        if (!cancelled) {
          setIsPremium(
            response?.isPremium === true
          );
        }
      } catch (error) {
        console.error(
          "Failed to load Premium status:",
          error
        );

        if (!cancelled) {
          setIsPremium(false);
        }
      } finally {
        if (!cancelled) {
          setPremiumLoading(false);
        }
      }
    };

    loadPremiumStatus();

    return () => {
      cancelled = true;
    };
  }, [token, isAdmin]);

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      category: "",
      price: "",
      currency: "NGN",

      negotiable: false,

      brand: "",
      model: "",

      quantity: 1,

      condition: "Used",

      country: "",
      state: "",
      lga: "",
      city: "",
      area: "",

      phone: "",
      whatsapp: "",

      deliveryAvailable: false,
      deliveryFee: 0,

      images: [],
    });

  // ==========================
  // Submit Listing
  // ==========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      console.log(
        "Submitting listing:",
        formData
      );

      await fetchWithToken(
        "/api/marketplace",
        token,
        {
          method: "POST",
          body: JSON.stringify(formData),
        }
      );

      alert(
        "Listing created successfully!"
      );

      navigate("/marketplace");
    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Failed to create listing."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-5">
      <h1 className="text-3xl font-bold mb-6">
        Create Marketplace Listing
      </h1>

      {premiumLoading ? (
        <div className="mb-6 rounded-lg border bg-gray-50 p-4 text-sm text-gray-600">
          Checking your seller plan...
        </div>
      ) : (
        <div className="mb-6 rounded-lg border bg-gray-50 p-4 text-sm text-gray-600">
          {isAdmin
            ? "Admin seller: unlimited images per listing."
            : isPremium
            ? "Premium seller: up to 10 images per listing."
            : "Free seller: 1 image per listing."}
        </div>
      )}

            <ListingForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        loading={loading || premiumLoading}
        isAdmin={isAdmin}
        isPremium={isPremium}
      />
    </div>
  );
}