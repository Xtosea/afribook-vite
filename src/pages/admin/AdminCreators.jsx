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

const AdminCreators = () => {

  const [creators, setCreators] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const token =
    localStorage.getItem("token");

  const fetchCreators =
    async () => {
      try {

        const res =
          await fetch(
            `${API_BASE}/api/admin/creators`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setCreators(data);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {
    fetchCreators();
  }, []);

  const updateStatus =
    async (
      id,
      action
    ) => {

      try {

        await fetch(
          `${API_BASE}/api/admin/creator/${id}/${action}`,
          {
            method: "PUT",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        fetchCreators();

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
          Creator Requests
        </h1>

        <button
          onClick={fetchCreators}
        >
          <RefreshCcw />
        </button>

      </div>

      <div className="space-y-4">

        {creators.map(
          creator => (

            <div
              key={creator._id}
              className="bg-gray-900 rounded-xl p-4"
            >

              <div className="flex gap-3 items-center">

                <img
                  src={
                    creator.profilePic
                  }
                  alt=""
                  className="w-12 h-12 rounded-full"
                />

                <div>

                  <h3>
                    {creator.name}
                  </h3>

                  <p className="text-sm text-gray-400">
                    {creator.email}
                  </p>

                </div>

              </div>

              <p className="mt-3">

                Status:
                {" "}
                {
                  creator.monetizationStatus
                }

              </p>

              {creator.monetizationStatus ===
                "pending" && (

                <div className="flex gap-3 mt-4">

                  <button
                    onClick={() =>
                      updateStatus(
                        creator._id,
                        "approve"
                      )
                    }
                    className="flex-1 bg-green-600 py-2 rounded-lg"
                  >
                    <CheckCircle className="inline mr-2" />
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        creator._id,
                        "reject"
                      )
                    }
                    className="flex-1 bg-red-600 py-2 rounded-lg"
                  >
                    <XCircle className="inline mr-2" />
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

export default AdminCreators;