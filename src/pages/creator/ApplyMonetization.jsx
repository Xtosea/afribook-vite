import { useState } from "react";
import { API_BASE } from "../../api/api";

export default function ApplyMonetization() {

  const [loading, setLoading] =
    useState(false);

  const token =
    localStorage.getItem("token");

  const apply = async () => {

    try {

      setLoading(true);

      const res =
        await fetch(
          `${API_BASE}/api/ad/apply`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        return alert(
          data.error
        );
      }

      alert(
        "Application submitted"
      );

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="p-4 text-white">

      <h1 className="text-2xl font-bold">
        Monetization
      </h1>

      <button
        onClick={apply}
        disabled={loading}
        className="mt-4 bg-blue-600 px-4 py-2 rounded"
      >
        Apply For Monetization
      </button>

    </div>
  );
}