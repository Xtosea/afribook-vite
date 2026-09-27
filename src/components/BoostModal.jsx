import React, { useEffect, useState } from "react";
import {
  Check,
  Loader2,
  Rocket,
  X,
} from "lucide-react";
import { fetchWithToken } from "../api/api";

export default function BoostModal({
  post,
  token,
  onClose,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingProductId, setProcessingProductId] =
    useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await fetchWithToken(
          "/api/products?type=boost&currency=NGN",
          token
        );

        setProducts(result?.products || []);
      } catch (err) {
        console.error(
          "BOOST PRODUCTS ERROR:",
          err
        );

        setError(
          err?.message ||
            "Failed to load Boost packages."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [token]);

  const handlePurchase = async (product) => {
    if (!token || !product?.id || !post?._id) {
      return;
    }

    try {
      setProcessingProductId(product.id);
      setError("");

      const result = await fetchWithToken(
        "/api/payments/paystack/initialize",
        token,
        {
          method: "POST",
          body: JSON.stringify({
            productId: product.id,
            targetPostId: post._id,
          }),
        }
      );

      const authorizationUrl =
        result?.payment?.authorizationUrl;

      if (!authorizationUrl) {
        throw new Error(
          "Paystack checkout URL was not returned."
        );
      }

      window.location.href = authorizationUrl;
    } catch (err) {
      console.error(
        "BOOST PAYSTACK INITIALIZATION ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to start Boost payment."
      );

      setProcessingProductId(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
              <Rocket
                size={24}
                className="text-blue-600"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Boost Your Post
              </h2>

              <p className="text-sm text-gray-500">
                Reach more people on AfricSocial
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close Boost"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">

          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2
                size={32}
                className="animate-spin text-blue-600"
              />
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={onClose}
                className="mt-5 px-5 py-2.5 rounded-xl bg-gray-800 text-white font-semibold"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold">
                  Choose a Boost package
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Your selected package will be applied to
                  this post after successful payment.
                </p>
              </div>

              {products.length === 0 ? (
                <div className="py-10 text-center text-gray-500">
                  No Boost packages are currently available.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-2xl p-5 flex flex-col"
                    >
                      <div>
                        <h4 className="text-lg font-bold">
                          {product.name}
                        </h4>

                        <p className="text-sm text-gray-500 mt-2 min-h-[40px]">
                          {product.description}
                        </p>
                      </div>

                      <div className="mt-5">
                        <div className="text-2xl font-bold">
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
                      </div>

                      {Array.isArray(product.benefits) &&
                        product.benefits.length > 0 && (
                          <div className="mt-5 space-y-2 flex-1">
                            {product.benefits.map(
                              (benefit) => (
                                <div
                                  key={benefit}
                                  className="flex items-start gap-2 text-sm text-gray-700"
                                >
                                  <Check
                                    size={17}
                                    className="text-green-600 mt-0.5 shrink-0"
                                  />

                                  <span>
                                    {benefit}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}

                      <button
                        type="button"
                        onClick={() =>
                          handlePurchase(product)
                        }
                        disabled={
                          processingProductId ===
                          product.id
                        }
                        className="w-full mt-6 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {processingProductId ===
                        product.id ? (
                          <>
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
                            Opening Paystack...
                          </>
                        ) : (
                          "Boost with Paystack"
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
