import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { fetchWithToken } from "../api/api";
import { useAuth } from "../context/AuthContext";

import MarketplaceHeader from "../components/marketplace/MarketplaceHeader";
import MarketplaceSearch from "../components/marketplace/MarketplaceSearch";
import CategoryFilter from "../components/marketplace/CategoryFilter";
import MarketplaceGrid from "../components/marketplace/MarketplaceGrid";

export default function Marketplace() {

  const { token } = useAuth();

  const [listings, setListings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState("All");

  useEffect(() => {

    const loadListings = async () => {

      try {

        const data = await fetchWithToken(
          "/api/marketplace",
          token
        );

        setListings(data.listings || []);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    };

    loadListings();

  }, [token]);

  const filtered = useMemo(() => {

    return listings.filter((item) => {

      const matchCategory =
        category === "All" ||
        item.category === category;

      const matchSearch =
        item.title
          .toLowerCase()
          .includes(search.toLowerCase());

      return (
        matchCategory &&
        matchSearch
      );

    });

  }, [listings, search, category]);

  return (

    <div className="max-w-7xl mx-auto p-4">

      <MarketplaceHeader
    total={listings.length}
   />

      <MarketplaceSearch
        value={search}
        onChange={setSearch}
      />

      <CategoryFilter
        selected={category}
        onSelect={setCategory}
      />

      <MarketplaceGrid
        listings={filtered}
        loading={loading}
      />

    </div>

  );

}