import React,
{
  useEffect,
  useState,
} from "react";

import {
  API_BASE,
} from "../../api/api";

const MyCampaigns = () => {

  const [campaigns,
    setCampaigns] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const token =
    localStorage.getItem("token");

  useEffect(() => {

    fetchCampaigns();

  }, []);

  const fetchCampaigns =
    async () => {

      try {

        const res =
          await fetch(
            `${API_BASE}/api/ad/my-campaigns`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setCampaigns(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
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

      <h1 className="text-2xl font-bold mb-6">
        My Campaigns
      </h1>

      <div className="space-y-4">

        {campaigns.map(
          (campaign) => (

            <div
              key={campaign._id}
              className="bg-gray-900 rounded-xl p-4"
            >

              <h3 className="font-bold">
                {campaign.title}
              </h3>

              <p className="text-gray-400">
                {campaign.description}
              </p>

              <div className="mt-3 space-y-1 text-sm">

                <p>
                  Budget:
                  ₦{campaign.budget}
                </p>

                <p>
                  Remaining:
                  ₦{campaign.remainingBudget}
                </p>

                <p>
                  Impressions:
                  {campaign.impressions}
                </p>

                <p>
                  Clicks:
                  {campaign.clicks}
                </p>

                <p>
                  Status:
                  {campaign.status}
                </p>

              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
};

export default MyCampaigns;