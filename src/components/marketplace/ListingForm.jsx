import React from "react";

import ImageUploader from "./ImageUploader";
import ImagePreview from "./ImagePreview";
import CategorySelect from "./CategorySelect";
import PriceInput from "./PriceInput";
import LocationSelector from "./LocationSelector";

const ListingForm = ({
  formData,
  setFormData,
  onSubmit,
  loading,
}) => {
  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6"
    >
      {/* Title */}

      <div>
        <label className="block mb-1 font-medium">
          Product Title
        </label>

        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            updateField("title", e.target.value)
          }
          className="w-full border rounded-lg p-3"
          placeholder="Product title"
          required
        />
      </div>

      {/* Description */}

      <div>
        <label className="block mb-1 font-medium">
          Description
        </label>

        <textarea
          rows={5}
          value={formData.description}
          onChange={(e) =>
            updateField(
              "description",
              e.target.value
            )
          }
          className="w-full border rounded-lg p-3"
          placeholder="Describe your item..."
          required
        />
      </div>

      {/* Category */}

      <CategorySelect
        value={formData.category}
        onChange={(value) =>
          updateField("category", value)
        }
      />

      {/* Price */}

      <PriceInput
        price={formData.price}
        currency={formData.currency}
        onPriceChange={(value) =>
          updateField("price", value)
        }
        onCurrencyChange={(value) =>
          updateField("currency", value)
        }
      />

      {/* Negotiable */}

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={formData.negotiable}
          onChange={(e) =>
            updateField(
              "negotiable",
              e.target.checked
            )
          }
        />

        Negotiable
      </label>

      {/* Condition */}

      <div>
        <label className="block mb-1 font-medium">
          Condition
        </label>

        <select
          value={formData.condition}
          onChange={(e) =>
            updateField(
              "condition",
              e.target.value
            )
          }
          className="w-full border rounded-lg p-3"
        >
          <option>Brand New</option>
          <option>Like New</option>
          <option>Used</option>
          <option>For Parts</option>
        </select>
      </div>

      {/* Quantity */}

      <div>
        <label className="block mb-1 font-medium">
          Quantity
        </label>

        <input
          type="number"
          min="1"
          value={formData.quantity}
          onChange={(e) =>
            updateField(
              "quantity",
              e.target.value
            )
          }
          className="w-full border rounded-lg p-3"
        />
      </div>

      {/* Location */}

      <LocationSelector
        country={formData.country}
        state={formData.state}
        lga={formData.lga}
        city={formData.city}
        area={formData.area}
        setCountry={(v) =>
          updateField("country", v)
        }
        setState={(v) =>
          updateField("state", v)
        }
        setLga={(v) =>
          updateField("lga", v)
        }
        setCity={(v) =>
          updateField("city", v)
        }
        setArea={(v) =>
          updateField("area", v)
        }
      />

      {/* Phone */}

      <div>
        <label className="block mb-1 font-medium">
          Phone Number
        </label>

        <input
          type="tel"
          value={formData.phone}
          onChange={(e) =>
            updateField("phone", e.target.value)
          }
          placeholder="+234..."
          className="w-full border rounded-lg p-3"
          required
        />
      </div>

      {/* WhatsApp */}

      <div>
        <label className="block mb-1 font-medium">
          WhatsApp Number
        </label>

        <input
          type="tel"
          value={formData.whatsapp}
          onChange={(e) =>
            updateField(
              "whatsapp",
              e.target.value
            )
          }
          placeholder="+234..."
          className="w-full border rounded-lg p-3"
        />
      </div>

      {/* Delivery */}

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={formData.deliveryAvailable}
          onChange={(e) =>
            updateField(
              "deliveryAvailable",
              e.target.checked
            )
          }
        />

        Delivery Available
      </label>

      {formData.deliveryAvailable && (
        <div>
          <label className="block mb-1 font-medium">
            Delivery Fee
          </label>

          <input
            type="number"
            value={formData.deliveryFee}
            onChange={(e) =>
              updateField(
                "deliveryFee",
                e.target.value
              )
            }
            className="w-full border rounded-lg p-3"
            placeholder="0"
          />
        </div>
      )}

      {/* Images */}

      <ImageUploader
        images={formData.images}
        setImages={(images) =>
          updateField("images", images)
        }
      />

      <ImagePreview
        images={formData.images}
      />

      {/* Submit */}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading
          ? "Creating Listing..."
          : "Create Listing"}
      </button>
    </form>
  );
};

export default ListingForm;