import React from "react";

import countries from "../../data/africa/countries";
import nigeria from "../../data/africa/nigeria";

const countryData = {
  Nigeria: nigeria,
  // Ghana: ghana,
  // Kenya: kenya,
  // "South Africa": southAfrica,
};

const LocationSelector = ({
  country,
  state,
  lga,
  city,
  area,

  setCountry,
  setState,
  setLga,
  setCity,
  setArea,
}) => {
  const data = countryData[country] || {};

  const states = Object.keys(data);

  const lgas = state
    ? Object.keys(data[state] || {})
    : [];

  const cities =
    state && lga
      ? data[state]?.[lga] || []
      : [];

  return (
    <div className="space-y-4">

      {/* COUNTRY */}

      <div>
        <label className="block mb-1 font-medium">
          Country
        </label>

        <select
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setState("");
            setLga("");
            setCity("");
            setArea("");
          }}
          className="w-full border rounded-lg p-3"
        >
          <option value="">
            Select Country
          </option>

          {countries.map((item) => (
            <option
              key={item.code}
              value={item.name}
            >
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {/* STATE */}

      <div>
        <label className="block mb-1 font-medium">
          State / Region
        </label>

        <select
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setLga("");
            setCity("");
            setArea("");
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

      {/* LGA / DISTRICT */}

      <div>
        <label className="block mb-1 font-medium">
          LGA / District
        </label>

        <select
          value={lga}
          onChange={(e) => {
            setLga(e.target.value);
            setCity("");
            setArea("");
          }}
          disabled={!state}
          className="w-full border rounded-lg p-3"
        >
          <option value="">
            Select LGA
          </option>

          {lgas.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* CITY */}

      <div>
        <label className="block mb-1 font-medium">
          City / Town
        </label>

        <select
          value={city}
          onChange={(e) =>
            setCity(e.target.value)
          }
          disabled={!lga}
          className="w-full border rounded-lg p-3"
        >
          <option value="">
            Select Town
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

      {/* AREA */}

      <div>
        <label className="block mb-1 font-medium">
          Area / Neighborhood
        </label>

        <input
          type="text"
          value={area}
          onChange={(e) =>
            setArea(e.target.value)
          }
          placeholder="Example: Lekki Phase 1"
          className="w-full border rounded-lg p-3"
        />
      </div>

    </div>
  );
};

export default LocationSelector;