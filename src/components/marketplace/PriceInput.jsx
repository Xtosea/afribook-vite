import React from "react";

const PriceInput = ({
  price,
  currency,
  onPriceChange,
  onCurrencyChange,
}) => {
  return (
    <div className="space-y-3">

      <div>
        <label className="block mb-1 font-medium">
          Currency
        </label>

        <select
          value={currency}
          onChange={(e) =>
            onCurrencyChange(e.target.value)
          }
          className="w-full border rounded-lg p-3"
        >
          <option value="">
            Select Currency
          </option>

          <option value="NGN">
            NGN ₦
          </option>

          <option value="GHS">
            GHS ₵
          </option>

          <option value="KES">
            KES
          </option>

          <option value="ZAR">
            ZAR
          </option>

          <option value="USD">
            USD $
          </option>

        </select>
      </div>


      <div>
        <label className="block mb-1 font-medium">
          Price
        </label>

        <input
          type="text"
          inputMode="numeric"
          value={price}
          onChange={(e) =>
            onPriceChange(e.target.value)
          }
          placeholder="Enter amount"
          className="w-full border rounded-lg p-3"
        />
      </div>

    </div>
  );
};

export default PriceInput;