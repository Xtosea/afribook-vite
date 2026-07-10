import React from "react";

const currencies = [
  { code: "NGN", symbol: "₦" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "GHS", symbol: "GH₵" },
  { code: "KES", symbol: "KSh" },
  { code: "ZAR", symbol: "R" },
];

const formatPrice = (value) => {
  if (!value) return "";

  const number = value.toString().replace(/\D/g, "");

  return Number(number).toLocaleString();
};

const PriceInput = ({
  price,
  setPrice,
  currency,
  setCurrency,
}) => {
  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");

    setPrice(raw);
  };

  return (
    <div className="space-y-2">

      <label className="block font-semibold text-gray-700">
        Price
      </label>

      <div className="flex gap-3">

        {/* Currency */}

        <select
          value={currency}
          onChange={(e) =>
            setCurrency(e.target.value)
          }
          className="border rounded-xl px-3 py-3 bg-white"
        >
          {currencies.map((item) => (
            <option
              key={item.code}
              value={item.code}
            >
              {item.symbol} {item.code}
            </option>
          ))}
        </select>

        {/* Price */}

        <input
          type="text"
          inputMode="numeric"
          placeholder="Enter price"
          value={formatPrice(price)}
          onChange={handlePriceChange}
          className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>

      <p className="text-xs text-gray-500">
        Example: ₦250,000
      </p>

    </div>
  );
};

export default PriceInput;