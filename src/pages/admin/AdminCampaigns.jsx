import React,
{
  useEffect,
  useState,
} from "react";

import {
  RefreshCcw,
  PauseCircle,
  PlayCircle,
  Trash2,
} from "lucide-react";

import {
  API_BASE,
} from "../../api/api";

const AdminCampaigns = () => {
    const [campaigns,
    setCampaigns] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const token =
    localStorage.getItem("token");

  const fetchCampaigns =
    async () => {

      try {

        const res =
          await fetch(
            `${API_BASE}/api/admin/campaigns`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

console.log("Campaign API:", data);

        setCampaigns(
  Array.isArray(data)
    ? data
    : data.campaigns || data.data || []
);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const action =
    async (
      id,
      type
    ) => {

      try {

        await fetch(
          `${API_BASE}/api/admin/campaign/${id}/${type}`,
          {
            method: "PUT",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        fetchCampaigns();

      } catch (err) {

        console.error(err);
      }
    };

  const deleteCampaign =
    async (id) => {

      if (
        !window.confirm(
          "Delete campaign?"
        )
      ) return;

      try {

        await fetch(
          `${API_BASE}/api/admin/campaign/${id}`,
          {
            method:
              "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        fetchCampaigns();

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

      <div className="flex justify-between mb-5">

        <h1 className="text-2xl font-bold">
          Campaigns
        </h1>

        <button
          onClick={
            fetchCampaigns
          }
        >
          <RefreshCcw />
        </button>

      </div>

      <div className="space-y-4">

       {Array.isArray(campaigns) &&
       campaigns.map((campaign) => (

            <div
              key={
                campaign._id
              }
              className="bg-gray-900 rounded-xl p-4"
            >

              <h3 className="font-bold">
                {
                  campaign.title
                }
              </h3>

              <p className="text-sm text-gray-400">
                Advertiser:
                {" "}
                {
                  campaign
                    .advertiser
                    ?.name
                }
              </p>

              <p>
                Budget:
                ₦
                {
                  campaign.budget
                }
              </p>

              <p>
                Spent:
                ₦
                {
                  campaign.spent
                }
              </p>

              <p>
                Impressions:
                {
                  campaign.impressions
                }
              </p>

              <p>
                Clicks:
                {
                  campaign.clicks
                }
              </p>

              <p>
                Status:
                {" "}
                {
                  campaign.status
                }
              </p>

              <div className="flex gap-3 mt-4">

                <button
                  onClick={() =>
                    action(
                      campaign._id,
                      "pause"
                    )
                  }
                  className="flex-1 bg-yellow-600 py-2 rounded-lg"
                >
                  <PauseCircle className="inline mr-2" />
                  Pause
                </button>

                <button
                  onClick={() =>
                    action(
                      campaign._id,
                      "resume"
                    )
                  }
                  className="flex-1 bg-green-600 py-2 rounded-lg"
                >
                  <PlayCircle className="inline mr-2" />
                  Resume
                </button>

                <button
                  onClick={() =>
                    deleteCampaign(
                      campaign._id
                    )
                  }
                  className="flex-1 bg-red-600 py-2 rounded-lg"
                >
                  <Trash2 className="inline mr-2" />
                  Delete
                </button>

              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
};

export default AdminCampaigns;