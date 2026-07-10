// src/pages/EditListing.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { fetchWithToken } from "../api/api";
import { useAuth } from "../context/AuthContext";

import ListingForm from "../components/marketplace/ListingForm";

export default function EditListing() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { token } = useAuth();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
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

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      setLoading(true);

      const res =
        await fetchWithToken(
          `/api/marketplace/${id}`,
          token
        );

      const listing = res.listing;

      setFormData({
        title: listing.title || "",
        description:
          listing.description || "",

        category:
          listing.category || "",

        price: listing.price || "",

        currency:
          listing.currency || "NGN",

        negotiable:
          listing.negotiable || false,

        brand:
          listing.brand || "",

        model:
          listing.model || "",

        quantity:
          listing.quantity || 1,

        condition:
          listing.condition || "Used",

        country:
          listing.location?.country ||
          "",

        state:
          listing.location?.state ||
          "",

        lga:
          listing.location?.lga || "",

        city:
          listing.location?.city ||
          "",

        area:
          listing.location?.area ||
          "",

        phone:
          listing.phone || "",

        whatsapp:
          listing.whatsapp || "",

        deliveryAvailable:
          listing.deliveryAvailable ||
          false,

        deliveryFee:
          listing.deliveryFee || 0,

        images:
          listing.images || [],
      });
    } catch (err) {
      console.error(err);

      alert("Failed to load listing.");

      navigate("/marketplace");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await fetchWithToken(
        `/api/marketplace/${id}`,
        token,
        {
          method: "PUT",

          body: JSON.stringify(
            formData
          ),
        }
      );

      alert(
        "Listing updated successfully."
      );

      navigate(`/marketplace/${id}`);
    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Failed to update listing."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        Loading listing...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-5">

      <h1 className="text-3xl font-bold mb-6">
        Edit Listing
      </h1>

      <ListingForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        loading={saving}
      />

    </div>
  );
}