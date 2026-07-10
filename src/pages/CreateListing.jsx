import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchWithToken } from "../api/api";
import { useAuth } from "../context/AuthContext";

import ListingForm from "../components/marketplace/ListingForm";

const CLOUDINARY_URL =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_URL;

const UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function CreateListing() {
  const navigate = useNavigate();

  const { token } = useAuth();

  const [loading, setLoading] =
    useState(false);

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
  // Upload images to Cloudinary
  // ==========================

  
  // ==========================
  // Submit Listing
  // ==========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Upload images first
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

      <ListingForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        loading={loading}
      />

    </div>
  );
}