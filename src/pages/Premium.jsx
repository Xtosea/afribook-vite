import React, { useEffect, useState } from "react";
import { Check, Crown, Loader2, ShieldCheck } from "lucide-react";
import { fetchWithToken } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Premium() {
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const loadPremium = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsRes, statusRes] = await Promise.all([
          fetchWithToken(
            "/api/products?type=premium&currency=NGN",
            token
          ),
          fetchWithToken(
            "/api/premium/status",
            token
          ),
        ]);

        setProducts(productsRes.products || []);
        setPremiumStatus(statusRes);
      } catch (err) {
        console.error(err);
        setError(
          err.message || "Failed to load Premium information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPremium();
  }, [token]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <Loader2
            size={32}
            className="animate-spin text-blue-600"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl border p-8 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const isPremium = premiumStatus?.isPremium === true;
  const subscription = premiumStatus?.subscription;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center">
              <Crown
                size={34}
                className="text-yellow-600"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                AfricSocial Premium
              </h1>

              <p className="text-gray-500 mt-1">
                Unlock more Marketplace features and seller
                benefits.
              </p>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
              isPremium
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {isPremium ? (
              <>
                <ShieldCheck size={18} />
                Premium Active
              </>
            ) : (
              "Free Seller"
            )}
          </div>
        </div>
      </div>

      {/* Current subscription */}
      {isPremium && subscription && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-green-800">
            Your Premium Membership
          </h2>

          <div className="mt-3 text-green-700 space-y-1">
            <p>
              Plan:{" "}
              <strong>
                {subscription.plan === "legacy"
                  ? "Legacy Premium"
                  : "Premium"}
              </strong>
            </p>

            {subscription.expiresAt ? (
              <p>
                Expires:{" "}
                <strong>
                  {new Date(
                    subscription.expiresAt
                  ).toLocaleDateString("en-NG")}
                </strong>
              </p>
            ) : (
              <p>
                <strong>No expiration</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Plans */}
      <div>
        <div className="mb-5">
          <h2 className="text-2xl font-bold">
            Choose Your Premium Plan
          </h2>

          <p className="text-gray-500 mt-1">
            Select a plan that works for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col"
            >
              <div>
                <h3 className="text-xl font-bold">
                  {product.name}
                </h3>

                <p className="text-gray-500 text-sm mt-2 min-h-[48px]">
                  {product.description}
                </p>
              </div>

              <div className="mt-5">
                <div className="text-3xl font-bold">
                  {formatPrice(
                    product.price ??
                      product.prices?.NGN ??
                      0
                  )}
                </div>

                {product.durationDays && (
                  <p className="text-sm text-gray-500 mt-1">
                    {product.durationDays} days
                  </p>
                )}

                {product.neverExpires && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    Never expires
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-3 flex-1">
                {(product.benefits || []).map(
                  (benefit) => (
                    <div
                      key={benefit}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <Check
                        size={18}
                        className="text-green-600 mt-0.5 shrink-0"
                      />

                      <span>{benefit}</span>
                    </div>
                  )
                )}
              </div>

              <button
                type="button"
                disabled
                className="w-full mt-6 px-5 py-3 rounded-xl bg-gray-300 text-gray-600 font-semibold cursor-not-allowed"
              >
                Payment Coming Soon
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
