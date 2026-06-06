import React, {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle,
  XCircle,
  RefreshCcw,
} from "lucide-react";

import {
  API_BASE,
} from "../../api/api";

const AdminAdvertisers = () => {

  const [advertisers,
    setAdvertisers] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const token =
    localStorage.getItem("token");

  const fetchAdvertisers =
    async () => {

      try {

        const res =
          await fetch(
            `${API_BASE}/api/admin/advertisers`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setAdvertisers(data.advertisers || data.data || data || []);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {
    fetchAdvertisers();
  }, []);

  const updateStatus =
    async (
      id,
      action
    ) => {

      try {

        await fetch(
          `${API_BASE}/api/admin/advertiser/${id}/${action}`,
          {
            method: "PUT",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        fetchAdvertisers();

      } catch (err) {

        console.error(err);
      }
    };

  if (loading) {
    return (
      <div className="text-white p-6">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">

      <div className="flex justify-between items-center mb-5">

        <h1 className="text-2xl font-bold">
          Advertisers
        </h1>

        <button
          onClick={fetchAdvertisers}
        >
          <RefreshCcw />
        </button>

      </div>

      <div className="space-y-4">

        {Array.isArray(advertisers) &&
  advertisers.map(advertiser => (

            <div
              key={advertiser._id}
              className="bg-gray-900 rounded-xl p-4"
            >

              <div className="flex gap-3 items-center">

                <img
  src={advertiser.profilePic || "/default-avatar.png"}
  className="w-12 h-12 rounded-full"
/>

                <div>

                  <h3>
                    {
                      advertiser.name
                    }
                  </h3>

                  <p className="text-sm text-gray-400">
                    {
                      advertiser.email
                    }
                  </p>

                </div>

              </div>

              <p className="mt-3">

                Status:
                {" "}
                {
                  advertiser.advertiserStatus
                }

              </p>

              {advertiser.advertiserStatus ===
                "pending" && (

                <div className="flex gap-3 mt-4">

                  <button
                    onClick={() =>
                      updateStatus(
                        advertiser._id,
                        "approve"
                      )
                    }
                    className="flex-1 bg-green-600 py-2 rounded-lg"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        advertiser._id,
                        "reject"
                      )
                    }
                    className="flex-1 bg-red-600 py-2 rounded-lg"
                  >
                    Reject
                  </button>

                </div>
              )}

            </div>
          )
        )}

      </div>

    </div>
  );
};

export default AdminAdvertisers;