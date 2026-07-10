import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import ListingForm from "../components/marketplace/ListingForm";

const CreateListing = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-2xl shadow p-6">

          <h1 className="text-3xl font-bold mb-2">
            Sell an Item
          </h1>

          <p className="text-gray-500 mb-6">
            Fill in the details below to create your marketplace listing.
          </p>

          <ListingForm />

        </div>
      </div>
    </div>
  );
};

export default CreateListing;