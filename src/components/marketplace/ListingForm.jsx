import React, { useState } from "react";

import ImageUploader from "./ImageUploader";
import ImagePreview from "./ImagePreview";
import CategorySelect from "./CategorySelect";
import PriceInput from "./PriceInput";

import { fetchWithToken } from "../../api/api";

const ListingForm = ({
  token,
  currentUser,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");

  const [description, setDescription] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [currency, setCurrency] =
    useState("NGN");

  const [category, setCategory] =
    useState("");

  const [condition, setCondition] =
    useState("Used");

  const [location, setLocation] =
    useState("");

  const [images, setImages] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const removeImage = (index) => {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim())
      return alert("Title is required.");

    if (!description.trim())
      return alert("Description is required.");

    if (!category)
      return alert("Select a category.");

    if (!location.trim())
      return alert("Location is required.");

    if (!price)
      return alert("Enter a price.");

    if (images.length === 0)
      return alert("Upload at least one image.");

    try {
      setLoading(true);

      const data = await fetchWithToken(
        "/api/marketplace",
        token,
        {
          method: "POST",
          body: JSON.stringify({
            title,
            description,
            price: Number(price),
            currency,
            category,
            condition,
            location,
            images,
          }),
        }
      );

      alert("Listing created successfully.");

      setTitle("");
      setDescription("");
      setPrice("");
      setCurrency("NGN");
      setCategory("");
      setCondition("Used");
      setLocation("");
      setImages([]);

      if (onSuccess) {
        onSuccess(data.listing);
      }

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Title */}

      <div>
        <label className="font-semibold">
          Title
        </label>

        <input
          className="w-full border rounded-xl p-3 mt-2"
          placeholder="iPhone 14 Pro Max..."
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />
      </div>

      {/* Description */}

      <div>
        <label className="font-semibold">
          Description
        </label>

        <textarea
          rows={5}
          className="w-full border rounded-xl p-3 mt-2"
          placeholder="Describe your item..."
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />
      </div>

      {/* Category */}

      <CategorySelect
        value={category}
        onChange={setCategory}
      />

      {/* Price */}

      <PriceInput
        price={price}
        setPrice={setPrice}
        currency={currency}
        setCurrency={setCurrency}
      />

      {/* Condition */}

      <div>
        <label className="font-semibold">
          Condition
        </label>

        <select
          className="w-full border rounded-xl p-3 mt-2"
          value={condition}
          onChange={(e) =>
            setCondition(e.target.value)
          }
        >
          <option value="New">
            New
          </option>

          <option value="Used">
            Used
          </option>
        </select>
      </div>

      {/* Location */}

      <div>
        <label className="font-semibold">
          Location
        </label>

        <input
          className="w-full border rounded-xl p-3 mt-2"
          placeholder="Lagos, Nigeria"
          value={location}
          onChange={(e) =>
            setLocation(e.target.value)
          }
        />
      </div>

      {/* Images */}

      <ImageUploader
        images={images}
        setImages={setImages}
        isPremium={currentUser?.isPremium}
      />

      <ImagePreview
        images={images}
        onRemove={removeImage}
      />

      {/* Submit */}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded-xl py-4 font-semibold hover:bg-blue-700 disabled:opacity-60"
      >
        {loading
          ? "Creating Listing..."
          : "Create Listing"}
      </button>
    </form>
  );
};

export default ListingForm;