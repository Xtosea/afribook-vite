import React from "react";

const nigeria = {
  Lagos: [
    "Ikeja",
    "Lekki",
    "Ajah",
    "Yaba",
    "Surulere",
    "Ikorodu",
    "Epe",
    "Badagry",
    "Victoria Island",
  ],

  Abuja: [
    "Garki",
    "Wuse",
    "Maitama",
    "Asokoro",
    "Gwarinpa",
    "Kubwa",
    "Lugbe",
  ],

  Rivers: [
    "Port Harcourt",
    "Obio-Akpor",
    "Eleme",
    "Oyigbo",
  ],

  Edo: [
    "Benin City",
    "Ekpoma",
    "Auchi",
    "Uromi",
  ],

  Delta: [
    "Warri",
    "Asaba",
    "Sapele",
    "Ughelli",
  ],
};

const LocationSelector = ({
  country,
  state,
  city,
  area,

  setCountry,
  setState,
  setCity,
  setArea,
}) => {

  const states =
    country === "Nigeria"
      ? Object.keys(nigeria)
      : [];

  const cities =
    country === "Nigeria" && state
      ? nigeria[state] || []
      : [];

  return (
    <div className="space-y-4">

      {/* Country */}

      <div>
        <label className="block mb-1 font-medium">
          Country
        </label>

        <select
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setState("");
            setCity("");
          }}
          className="w-full border rounded-lg p-3"
        >
          <option value="">
            Select Country
          </option>

          <option value="Nigeria">
            Nigeria
          </option>

          {/* More countries later */}

        </select>
      </div>

      {/* State */}

      <div>
        <label className="block mb-1 font-medium">
          State / Region
        </label>

        <select
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setCity("");
          }}
          disabled={!country}
          className="w-full border rounded-lg p-3"
        >
          <option value="">
            Select State
          </option>

          {states.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* City */}

      <div>
        <label className="block mb-1 font-medium">
          City / Town
        </label>

        <select
          value={city}
          onChange={(e) =>
            setCity(e.target.value)
          }
          disabled={!state}
          className="w-full border rounded-lg p-3"
        >
          <option value="">
            Select City
          </option>

          {cities.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Area */}

      <div>
        <label className="block mb-1 font-medium">
          Area / Neighborhood
        </label>

        <input
          type="text"
          placeholder="Example: Sangotedo"
          value={area}
          onChange={(e) =>
            setArea(e.target.value)
          }
          className="w-full border rounded-lg p-3"
        />
      </div>

    </div>
  );
};

export default LocationSelector;