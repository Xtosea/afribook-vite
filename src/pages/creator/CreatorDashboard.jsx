import { Link }
from "react-router-dom";

export default function CreatorDashboard() {

  return (
    <div className="p-4 text-white">

      <h1 className="text-3xl font-bold mb-6">
        Creator Dashboard
      </h1>

      <div className="grid gap-4">

        <Link
          to="/creator/earnings"
          className="bg-gray-900 p-4 rounded-xl"
        >
          Earnings
        </Link>

        <Link
          to="/creator/apply"
          className="bg-gray-900 p-4 rounded-xl"
        >
          Monetization
        </Link>

      </div>

    </div>
  );
}