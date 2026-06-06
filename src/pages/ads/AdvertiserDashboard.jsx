import { Link }
from "react-router-dom";

export default function AdvertiserDashboard() {

  return (
    <div className="p-4 text-white">

      <h1 className="text-3xl font-bold mb-6">
        Advertiser Dashboard
      </h1>

      <div className="grid gap-4">

        <Link
          to="/ads/create"
          className="bg-gray-900 p-4 rounded-xl"
        >
          Create Campaign
        </Link>

        <Link
          to="/ads/campaigns"
          className="bg-gray-900 p-4 rounded-xl"
        >
          My Campaigns
        </Link>

        <Link
          to="/ads/apply"
          className="bg-gray-900 p-4 rounded-xl"
        >
          Advertiser Approval
        </Link>

      </div>

    </div>
  );
}