import React, {
  useEffect,
  useState,
} from "react";

import {
  API_BASE,
} from "../../api/api";

const CreatorEarnings = () => {

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const token =
    localStorage.getItem("token");

  useEffect(() => {

    fetchEarnings();

  }, []);

  const fetchEarnings =
    async () => {

      try {

        const res =
          await fetch(
            `${API_BASE}/api/earnings/me`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const result =
          await res.json();

        setData(result);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const earnings =
    Array.isArray(data?.earnings)
      ? data.earnings
      : [];

  return (
    <div className="min-h-screen bg-black text-white p-4">

      <h1 className="text-3xl font-bold mb-6">
        Creator Earnings
      </h1>

      {/* Summary Cards */}

      <div className="grid grid-cols-2 gap-4 mb-6">

        <div className="bg-gray-900 p-4 rounded-xl">

          <p className="text-gray-400">
            Pending
          </p>

          <h2 className="text-2xl font-bold">
            ₦{data?.pending || 0}
          </h2>

        </div>

        <div className="bg-gray-900 p-4 rounded-xl">

          <p className="text-gray-400">
            Approved
          </p>

          <h2 className="text-2xl font-bold">
            ₦{data?.approved || 0}
          </h2>

        </div>

      </div>

      {/* Earnings List */}

      <div className="space-y-4">

        {earnings.length === 0 && (

          <div className="bg-gray-900 p-4 rounded-xl">

            No earnings yet

          </div>
        )}

        {earnings.map(
          (earning) => (

            <div
              key={earning._id}
              className="bg-gray-900 p-4 rounded-xl"
            >

              <div className="flex justify-between">

                <div>

                  <p className="font-semibold">
                    Campaign
                  </p>

                  <p className="text-sm text-gray-400">
                    {
                      earning.campaign
                        ?._id ||
                      earning.campaign
                    }
                  </p>

                </div>

                <div className="text-right">

                  <p className="font-bold">
                    ₦{earning.amount}
                  </p>

                  <p
                    className={`text-sm ${
                      earning.status ===
                      "approved"
                        ? "text-green-400"
                        : earning.status ===
                          "rejected"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {earning.status}
                  </p>

                </div>

              </div>

              <p className="text-xs text-gray-500 mt-2">
                {new Date(
                  earning.createdAt
                ).toLocaleString()}
              </p>

            </div>
          )
        )}

      </div>

    </div>
  );
};

export default CreatorEarnings;