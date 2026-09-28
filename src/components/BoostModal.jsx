import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Rocket,
  X,
} from "lucide-react";
import { fetchWithToken } from "../api/api";

const GOALS = [
  {
    id: "views",
    label: "More views",
    description: "Reach more people with your post.",
  },
  {
    id: "engagement",
    label: "More engagement",
    description: "Encourage more likes, comments and shares.",
  },
  {
    id: "profile_visits",
    label: "More profile visits",
    description: "Bring more people to your profile.",
  },
  {
    id: "followers",
    label: "More followers",
    description: "Help more people discover and follow you.",
  },
];

const DURATIONS = [1, 2, 4, 7, 10, 14, 30];

const STEP_NAMES = [
  "Goal",
  "Audience",
  "Targeting",
  "Duration",
  "Start",
  "Review",
];

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

  const [step, setStep] = useState(1);

  const [goal, setGoal] = useState("views");
  const [audience, setAudience] = useState("automatic");

  const [niche, setNiche] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(45);
  const [gender, setGender] = useState("all");

  const [durationDays, setDurationDays] = useState(7);

  const [startMode, setStartMode] = useState("now");
  const [scheduledStart, setScheduledStart] = useState("");

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

        setProducts(
          Array.isArray(result?.products)
            ? result.products
            : []
        );
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

  const sortedProducts = useMemo(() => {
    return [...products].sort(
      (a, b) =>
        Number(a.durationDays || 0) -
        Number(b.durationDays || 0)
    );
  }, [products]);

  const selectedProduct = useMemo(() => {
    if (!sortedProducts.length) return null;

    let closest = sortedProducts[0];
    let closestDifference = Math.abs(
      Number(closest.durationDays || 0) -
        durationDays
    );

    for (const product of sortedProducts) {
      const productDuration = Number(
        product.durationDays || 0
      );

      const difference = Math.abs(
        productDuration - durationDays
      );

      if (difference < closestDifference) {
        closest = product;
        closestDifference = difference;
      }
    }

    return closest;
  }, [sortedProducts, durationDays]);

  const selectedPrice = selectedProduct
    ? Number(
        selectedProduct.price ??
          selectedProduct.prices?.NGN ??
          0
      )
    : 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getGoalLabel = () => {
    return (
      GOALS.find(
        (item) => item.id === goal
      )?.label || "More views"
    );
  };

  const getAudienceLabel = () => {
    return audience === "custom"
      ? "Custom audience"
      : "Automatic audience";
  };

  const getStartLabel = () => {
    if (startMode === "now") {
      return "Start now";
    }

    if (!scheduledStart) {
      return "Scheduled start";
    }

    return new Date(
      scheduledStart
    ).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getEndDate = () => {
    const start =
      startMode === "now"
        ? new Date()
        : scheduledStart
          ? new Date(scheduledStart)
          : null;

    if (!start) return null;

    const end = new Date(start);
    end.setDate(
      end.getDate() + durationDays
    );

    return end;
  };

  const endDate = getEndDate();

  const canContinue = () => {
    if (step === 1) {
      return Boolean(goal);
    }

    if (step === 2) {
      return Boolean(audience);
    }

    if (step === 3) {
      if (audience !== "custom") {
        return true;
      }

      return (
        ageMin >= 13 &&
        ageMax <= 100 &&
        ageMin <= ageMax
      );
    }

    if (step === 4) {
      return (
        durationDays >= 1 &&
        durationDays <= 30 &&
        Boolean(selectedProduct)
      );
    }

    if (step === 5) {
      if (startMode === "now") {
        return true;
      }

      return Boolean(scheduledStart);
    }

    return true;
  };

  const nextStep = () => {
    if (!canContinue()) return;

    setError("");

    if (step < 6) {
      setStep((current) => current + 1);
    }
  };

  const previousStep = () => {
    setError("");

    if (step > 1) {
      setStep((current) => current - 1);
    }
  };

  const handlePurchase = async () => {
    if (
      !token ||
      !selectedProduct?.id ||
      !post?._id
    ) {
      setError(
        "Unable to prepare this Boost payment."
      );
      return;
    }

    try {
      setProcessingProductId(
        selectedProduct.id
      );
      setError("");

      const result = await fetchWithToken(
        "/api/payments/paystack/initialize",
        token,
        {
          method: "POST",
          body: JSON.stringify({
  productId: selectedProduct.id,
  targetPostId: post._id,

  boostConfig: {
    goal,
    audience,

    targeting:
      audience === "custom"
        ? {
            niche: niche.trim(),
            country,
            state: state.trim(),
            city: city.trim(),
            ageMin: Number(ageMin),
            ageMax: Number(ageMax),
            gender,
          }
        : null,

    durationDays: Number(durationDays),

    startMode,

    scheduledStart:
      startMode === "scheduled"
        ? scheduledStart
        : null,
  },
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

      window.location.href =
        authorizationUrl;
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

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">

        {/* HEADER */}
        <div className="sticky top-0 z-20 bg-white border-b px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Rocket
                size={22}
                className="text-blue-600"
              />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                Boost Your Post
              </h2>

              <p className="text-xs sm:text-sm text-gray-500">
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

        {/* PROGRESS */}
        <div className="px-5 sm:px-6 pt-5">
          <div className="flex items-center justify-between gap-1">
            {STEP_NAMES.map(
              (name, index) => {
                const stepNumber =
                  index + 1;

                const active =
                  stepNumber === step;

                const completed =
                  stepNumber < step;

                return (
                  <div
                    key={name}
                    className="flex-1"
                  >
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          active || completed
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {completed ? (
                          <Check size={14} />
                        ) : (
                          stepNumber
                        )}
                      </div>

                      {index <
                        STEP_NAMES.length -
                          1 && (
                        <div
                          className={`h-1 flex-1 rounded ${
                            completed
                              ? "bg-blue-600"
                              : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>

                    <p
                      className={`hidden sm:block text-xs mt-1 ${
                        active
                          ? "text-blue-600 font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      {name}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-5 sm:p-6">

          {/* ERROR */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2
                size={34}
                className="animate-spin text-blue-600"
              />

              <p className="mt-3 text-sm text-gray-500">
                Loading Boost options...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <Rocket
                size={42}
                className="mx-auto text-gray-400"
              />

              <p className="mt-4 text-gray-600">
                No Boost packages are currently
                available.
              </p>
            </div>
          ) : (
            <>
              {/* STEP 1 — GOAL */}
              {step === 1 && (
                <div>
                  <h3 className="text-xl font-bold">
                    What is your goal?
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 mb-5">
                    Choose what you want your Boost
                    campaign to achieve.
                  </p>

                  <div className="grid gap-3">
                    {GOALS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setGoal(item.id)
                        }
                        className={`text-left p-4 rounded-2xl border-2 transition ${
                          goal === item.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              goal === item.id
                                ? "border-blue-600"
                                : "border-gray-300"
                            }`}
                          >
                            {goal === item.id && (
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold">
                              {item.label}
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2 — AUDIENCE */}
              {step === 2 && (
                <div>
                  <h3 className="text-xl font-bold">
                    Choose your audience
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 mb-5">
                    Decide whether AfricSocial should
                    automatically find an audience or
                    use your targeting preferences.
                  </p>

                  <div className="grid gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setAudience("automatic")
                      }
                      className={`text-left p-5 rounded-2xl border-2 ${
                        audience === "automatic"
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center ${
                            audience ===
                            "automatic"
                              ? "border-blue-600"
                              : "border-gray-300"
                          }`}
                        >
                          {audience ===
                            "automatic" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                          )}
                        </div>

                        <div>
                          <p className="font-semibold">
                            Automatic
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            Let AfricSocial find people
                            who may be interested in
                            your content.
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setAudience("custom")
                      }
                      className={`text-left p-5 rounded-2xl border-2 ${
                        audience === "custom"
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center ${
                            audience === "custom"
                              ? "border-blue-600"
                              : "border-gray-300"
                          }`}
                        >
                          {audience ===
                            "custom" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                          )}
                        </div>

                        <div>
                          <p className="font-semibold">
                            Custom
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            Choose location, age, gender
                            and interests.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 — TARGETING */}
              {step === 3 && (
                <div>
                  <h3 className="text-xl font-bold">
                    Targeting
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 mb-5">
                    Define who should see your Boost.
                  </p>

                  {audience === "automatic" ? (
                    <div className="rounded-2xl bg-blue-50 border border-blue-200 p-5">
                      <div className="flex gap-3">
                        <Check className="text-blue-600 shrink-0" />

                        <div>
                          <p className="font-semibold text-blue-900">
                            Automatic targeting
                          </p>

                          <p className="text-sm text-blue-800 mt-1">
                            AfricSocial will determine
                            the audience automatically.
                            You can still continue to
                            choose your campaign duration.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">

                      {/* NICHE */}
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Niche / Interests
                        </label>

                        <input
                          type="text"
                          value={niche}
                          onChange={(e) =>
                            setNiche(e.target.value)
                          }
                          placeholder="e.g. Fashion, Music, Business"
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>

                      {/* COUNTRY */}
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Country
                        </label>

                        <select
                          value={country}
                          onChange={(e) =>
                            setCountry(e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white"
                        >
                          <option>Nigeria</option>
                          <option>Ghana</option>
                          <option>Kenya</option>
                          <option>South Africa</option>
                        </select>
                      </div>

                      {/* STATE + CITY */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            State
                          </label>

                          <input
                            type="text"
                            value={state}
                            onChange={(e) =>
                              setState(
                                e.target.value
                              )
                            }
                            placeholder="e.g. Lagos"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            City
                          </label>

                          <input
                            type="text"
                            value={city}
                            onChange={(e) =>
                              setCity(
                                e.target.value
                              )
                            }
                            placeholder="e.g. Ikeja"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                      </div>

                      {/* AGE */}
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Age range
                        </label>

                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="number"
                            min="13"
                            max="100"
                            value={ageMin}
                            onChange={(e) =>
                              setAgeMin(
                                Number(
                                  e.target.value
                                )
                              )
                            }
                            className="border border-gray-300 rounded-xl px-4 py-3"
                            placeholder="Minimum"
                          />

                          <input
                            type="number"
                            min="13"
                            max="100"
                            value={ageMax}
                            onChange={(e) =>
                              setAgeMax(
                                Number(
                                  e.target.value
                                )
                              )
                            }
                            className="border border-gray-300 rounded-xl px-4 py-3"
                            placeholder="Maximum"
                          />
                        </div>
                      </div>

                      {/* GENDER */}
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Gender
                        </label>

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            ["all", "All"],
                            ["male", "Male"],
                            ["female", "Female"],
                          ].map(
                            ([value, label]) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() =>
                                  setGender(value)
                                }
                                className={`py-3 rounded-xl border font-medium ${
                                  gender === value
                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                    : "border-gray-200 hover:border-blue-300"
                                }`}
                              >
                                {label}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4 — DURATION */}
              {step === 4 && (
                <div>
                  <h3 className="text-xl font-bold">
                    Set your duration
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    More days means a longer Boost
                    campaign.
                  </p>

                  <div className="mt-8 rounded-2xl bg-gray-50 border p-6">

                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Duration
                        </p>

                        <p className="text-3xl font-bold mt-1">
                          {durationDays} day
                          {durationDays === 1
                            ? ""
                            : "s"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Current package
                        </p>

                        <p className="text-2xl font-bold text-blue-600">
                          {formatPrice(
                            selectedPrice
                          )}
                        </p>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={durationDays}
                      onChange={(e) =>
                        setDurationDays(
                          Number(e.target.value)
                        )
                      }
                      className="w-full mt-8 accent-blue-600"
                    />

                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>1 day</span>
                      <span>30 days</span>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {DURATIONS.map(
                        (days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() =>
                              setDurationDays(
                                days
                              )
                            }
                            className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                              durationDays ===
                              days
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-gray-200 hover:border-blue-300"
                            }`}
                          >
                            {days}d
                          </button>
                        )
                      )}
                    </div>

                    {selectedProduct && (
                      <div className="mt-6 p-4 bg-white border rounded-xl">
                        <p className="text-sm font-semibold">
                          Selected Boost package
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          {selectedProduct.name}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          The current backend package
                          closest to your selected
                          duration will be used for
                          payment in Stage 1.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5 — START */}
              {step === 5 && (
                <div>
                  <h3 className="text-xl font-bold">
                    When should your Boost start?
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 mb-5">
                    Start immediately or schedule your
                    campaign.
                  </p>

                  <div className="grid gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setStartMode("now")
                      }
                      className={`text-left p-5 rounded-2xl border-2 ${
                        startMode === "now"
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <p className="font-semibold">
                        Start now
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Your Boost will be ready to
                        start after payment and approval.
                      </p>
                    </button>

                    <div
                      className={`p-5 rounded-2xl border-2 ${
                        startMode ===
                        "scheduled"
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setStartMode(
                            "scheduled"
                          )
                        }
                        className="text-left w-full"
                      >
                        <p className="font-semibold">
                          Schedule start
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          Choose when you want the
                          campaign to begin.
                        </p>
                      </button>

                      {startMode ===
                        "scheduled" && (
                        <input
                          type="datetime-local"
                          value={
                            scheduledStart
                          }
                          onChange={(e) =>
                            setScheduledStart(
                              e.target.value
                            )
                          }
                          className="w-full mt-4 border border-gray-300 rounded-xl px-4 py-3 bg-white"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6 — REVIEW */}
              {step === 6 && (
                <div>
                  <h3 className="text-xl font-bold">
                    Review your Boost
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 mb-5">
                    Check your campaign settings before
                    opening Paystack.
                  </p>

                  <div className="border rounded-2xl overflow-hidden">
                    <div className="p-4 flex justify-between gap-4 border-b">
                      <span className="text-gray-500">
                        Goal
                      </span>

                      <span className="font-semibold text-right">
                        {getGoalLabel()}
                      </span>
                    </div>

                    <div className="p-4 flex justify-between gap-4 border-b">
                      <span className="text-gray-500">
                        Audience
                      </span>

                      <span className="font-semibold text-right">
                        {getAudienceLabel()}
                      </span>
                    </div>

                    {audience === "custom" && (
                      <>
                        <div className="p-4 flex justify-between gap-4 border-b">
                          <span className="text-gray-500">
                            Niche
                          </span>

                          <span className="font-semibold text-right">
                            {niche || "Any"}
                          </span>
                        </div>

                        <div className="p-4 flex justify-between gap-4 border-b">
                          <span className="text-gray-500">
                            Location
                          </span>

                          <span className="font-semibold text-right">
                            {[
                              city,
                              state,
                              country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>

                        <div className="p-4 flex justify-between gap-4 border-b">
                          <span className="text-gray-500">
                            Age
                          </span>

                          <span className="font-semibold">
                            {ageMin}–{ageMax}
                          </span>
                        </div>

                        <div className="p-4 flex justify-between gap-4 border-b">
                          <span className="text-gray-500">
                            Gender
                          </span>

                          <span className="font-semibold capitalize">
                            {gender}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="p-4 flex justify-between gap-4 border-b">
                      <span className="text-gray-500">
                        Duration
                      </span>

                      <span className="font-semibold">
                        {durationDays} days
                      </span>
                    </div>

                    <div className="p-4 flex justify-between gap-4 border-b">
                      <span className="text-gray-500">
                        Starts
                      </span>

                      <span className="font-semibold text-right">
                        {getStartLabel()}
                      </span>
                    </div>

                    <div className="p-4 flex justify-between gap-4">
                      <span className="text-gray-500">
                        Ends
                      </span>

                      <span className="font-semibold text-right">
                        {endDate
                          ? endDate.toLocaleString(
                              "en-NG",
                              {
                                dateStyle:
                                  "medium",
                                timeStyle:
                                  "short",
                              }
                            )
                          : "Calculated after scheduling"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-blue-50 border border-blue-200 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-blue-700">
                          Total
                        </p>

                        <p className="text-3xl font-bold text-blue-900 mt-1">
                          {formatPrice(
                            selectedPrice
                          )}
                        </p>
                      </div>

                      <Rocket
                        size={32}
                        className="text-blue-600"
                      />
                    </div>

                    <p className="text-xs text-blue-700 mt-3">
                      Payment will be processed securely
                      through Paystack. Your Boost remains
                      subject to the existing AfricSocial
                      approval process.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        {!loading &&
          products.length > 0 && (
            <div className="sticky bottom-0 bg-white border-t px-5 sm:px-6 py-4 flex items-center justify-between gap-3">

              <button
                type="button"
                onClick={
                  step === 1
                    ? onClose
                    : previousStep
                }
                className="px-5 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-50 flex items-center gap-2"
              >
                {step === 1 ? (
                  <>
                    <X size={18} />
                    Cancel
                  </>
                ) : (
                  <>
                    <ArrowLeft size={18} />
                    Back
                  </>
                )}
              </button>

              {step < 6 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canContinue()}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={
                    !selectedProduct ||
                    processingProductId ===
                      selectedProduct?.id
                  }
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processingProductId ===
                  selectedProduct?.id ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Opening Paystack...
                    </>
                  ) : (
                    <>
                      <Rocket size={18} />
                      Pay with Paystack
                    </>
                  )}
                </button>
              )}
            </div>
          )}
      </div>
    </div>
  );
}