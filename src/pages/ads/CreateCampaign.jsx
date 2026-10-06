import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchWithToken } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

const EMPTY_FORM = {
  productId: "",
  title: "",
  description: "",
  mediaUrl: "",
  destinationUrl: "",
  cta: "Learn More",
  ageMin: 18,
  ageMax: 65,
  gender: "all",
  country: "",
  state: "",
  city: "",
  customAmount: "",
};

const CreateCampaign = () => {
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setError("");

        const result = await fetchWithToken(
          "/api/ads/products?currency=NGN",
          token
        );

        setProducts(Array.isArray(result?.products) ? result.products : []);
      } catch (err) {
        console.error("ADVERTISEMENT PRODUCTS ERROR:", err);
        setError(
          err?.message || "Failed to load advertisement packages."
        );
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [token]);

  const selectedProduct = products.find(
    (product) => product.id === form.productId
  );

  const isEnterprise = selectedProduct?.customAmountAllowed === true;

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProductChange = (event) => {
    const productId = event.target.value;

    setForm((current) => ({
      ...current,
      productId,
      customAmount: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      setError("Please log in before creating an advertisement.");
      return;
    }

    if (!selectedProduct) {
      setError("Please select an advertisement package.");
      return;
    }

    if (isEnterprise) {
      const customAmount = Number(form.customAmount);
      const minimumAmount = Number(
        selectedProduct.minimumAmount || 100000
      );

      if (!Number.isFinite(customAmount) || customAmount < minimumAmount) {
        setError(
          `Enterprise campaigns require a minimum budget of ${formatPrice(
            minimumAmount
          )}.`
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      setError("");

      const campaignPayload = {
        productId: form.productId,
        title: form.title.trim(),
        description: form.description.trim(),
        mediaUrl: form.mediaUrl.trim(),
        destinationUrl: form.destinationUrl.trim() || undefined,
        cta: form.cta.trim() || "Learn More",
        target: {
          ageMin: Number(form.ageMin),
          ageMax: Number(form.ageMax),
          gender: form.gender,
          country: form.country.trim(),
          state: form.state.trim(),
          city: form.city.trim(),
        },
      };

      if (isEnterprise) {
        campaignPayload.customAmount = Number(form.customAmount);
      }

      const campaignResult = await fetchWithToken(
        "/api/ads/campaigns",
        token,
        {
          method: "POST",
          body: JSON.stringify(campaignPayload),
        }
      );

      const campaignId =
        campaignResult?.campaign?._id ||
        campaignResult?.campaign?.id;

      if (!campaignId) {
        throw new Error(
          "Campaign was created, but no campaign ID was returned."
        );
      }

      const paymentResult = await fetchWithToken(
        "/api/payments/paystack/initialize",
        token,
        {
          method: "POST",
          body: JSON.stringify({
            productId: selectedProduct.id,
            advertisementCampaignId: campaignId,
          }),
        }
      );

      const authorizationUrl =
        paymentResult?.payment?.authorizationUrl;

      if (!authorizationUrl) {
        throw new Error(
          "Paystack checkout URL was not returned."
        );
      }

      window.location.href = authorizationUrl;
    } catch (err) {
      console.error(
        "ADVERTISEMENT CAMPAIGN PAYMENT ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to create the advertisement campaign."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProducts) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2
            size={36}
            className="mx-auto animate-spin text-blue-500"
          />
          <p className="mt-4 text-gray-400">
            Loading advertisement packages...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Create Advertisement Campaign
        </h1>

        <p className="text-gray-400 mb-6">
          Choose a campaign package, create your advertisement,
          then continue to secure Paystack payment.
        </p>

        {error && (
          <div className="mb-5 rounded-xl border border-red-700 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="block mb-2 font-medium">
              Advertisement Package
            </label>

            <select
              name="productId"
              value={form.productId}
              onChange={handleProductChange}
              required
              disabled={submitting}
              className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800"
            >
              <option value="">
                Select a package
              </option>

              {products.map((product) => {
                const price = product?.prices?.NGN;
                const custom =
                  product.customAmountAllowed === true;

                return (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name} —{" "}
                    {custom
                      ? `from ${formatPrice(
                          product.minimumAmount || price
                        )}`
                      : formatPrice(price)}{" "}
                    / {product.durationDays} day
                    {product.durationDays === 1 ? "" : "s"}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedProduct && (
            <div className="rounded-xl bg-gray-900 border border-gray-800 p-4">
              <p className="font-semibold">
                {selectedProduct.name}
              </p>

              <p className="text-gray-400 text-sm mt-1">
                {selectedProduct.description}
              </p>

              <p className="text-blue-400 font-semibold mt-3">
                {isEnterprise
                  ? `Minimum ${formatPrice(
                      selectedProduct.minimumAmount || 100000
                    )}`
                  : formatPrice(
                      selectedProduct?.prices?.NGN
                    )}{" "}
                · {selectedProduct.durationDays} days
              </p>
            </div>
          )}

          {isEnterprise && (
            <div>
              <label className="block mb-2 font-medium">
                Enterprise Campaign Amount (NGN)
              </label>

              <input
                type="number"
                name="customAmount"
                value={form.customAmount}
                onChange={handleChange}
                min={selectedProduct?.minimumAmount || 100000}
                step="100"
                required
                disabled={submitting}
                placeholder="Minimum ₦100,000"
                className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800"
              />

              <p className="text-gray-500 text-sm mt-1">
                Minimum:{" "}
                {formatPrice(
                  selectedProduct?.minimumAmount || 100000
                )}
              </p>
            </div>
          )}

          <div>
            <label className="block mb-2 font-medium">
              Campaign Title
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              maxLength={150}
              required
              disabled={submitting}
              placeholder="Campaign title"
              className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength={2000}
              required
              disabled={submitting}
              rows={5}
              placeholder="Describe your advertisement"
              className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Media URL
            </label>

            <input
              type="url"
              name="mediaUrl"
              value={form.mediaUrl}
              onChange={handleChange}
              required
              disabled={submitting}
              placeholder="https://..."
              className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Destination URL
            </label>

            <input
              type="url"
              name="destinationUrl"
              value={form.destinationUrl}
              onChange={handleChange}
              disabled={submitting}
              placeholder="https://yourwebsite.com"
              className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Call To Action
            </label>

            <select
              name="cta"
              value={form.cta}
              onChange={handleChange}
              disabled={submitting}
              className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800"
            >
              <option value="Learn More">Learn More</option>
              <option value="Shop Now">Shop Now</option>
              <option value="Visit Website">
                Visit Website
              </option>
              <option value="Sign Up">Sign Up</option>
              <option value="Contact Us">Contact Us</option>
              <option value="Download">Download</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium">
                Minimum Age
              </label>

              <input
                type="number"
                name="ageMin"
                value={form.ageMin}
                onChange={handleChange}
                min="13"
                max="100"
                required
                disabled={submitting}
                className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Maximum Age
              </label>

              <input
                type="number"
                name="ageMax"
                value={form.ageMax}
                onChange={handleChange}
                min="13"
                max="100"
                required
                disabled={submitting}
                className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Gender
            </label>

            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              disabled={submitting}
              className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800"
            >
              <option value="all">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Country"
              className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800"
            />

            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              disabled={submitting}
              placeholder="State"
              className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800"
            />

            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              disabled={submitting}
              placeholder="City"
              className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedProduct}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 rounded-xl font-semibold"
          >
            {submitting
              ? "Creating campaign and opening Paystack..."
              : "Create Campaign & Pay with Paystack"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;