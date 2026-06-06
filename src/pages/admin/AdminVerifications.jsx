import React, {
  useEffect,
  useState,
} from "react";

import {
  RefreshCcw,
  CheckCircle,
  XCircle,
} from "lucide-react";

import {
  API_BASE,
} from "../../api/api";

const AdminVerifications = () => {

  const [verifications, setVerifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const token =
    localStorage.getItem("token");

  const fetchVerifications =
    async () => {
      try {

        setLoading(true);

        const res =
          await fetch(
            `${API_BASE}/api/admin/verifications`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setVerifications(data.verifications || data.data || data || []);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const updateStatus =
    async (
      id,
      action
    ) => {

      try {

        const res =
          await fetch(
            `${API_BASE}/api/admin/verification/${id}/${action}`,
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        if (!res.ok) {
          alert(
            data.error ||
            "Action failed"
          );
          return;
        }

        fetchVerifications();

      } catch (err) {

        console.error(err);
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold">
          Verification Requests
        </h1>

        <button
          onClick={fetchVerifications}
          className="bg-gray-800 p-2 rounded-full"
        >
          <RefreshCcw size={18} />
        </button>

      </div>

      <div className="space-y-4">

        {Array.isArray(verifications) &&
  verifications.map((item) => (
            <div
              key={item._id}
              className="bg-gray-900 rounded-2xl p-4"
            >

              <div className="flex gap-3">

                <img
                  src={
                    item.user
                      ?.profilePic ||
                    "/default-avatar.png"
                  }
                  alt=""
                  className="w-14 h-14 rounded-full object-cover"
                />

                <div>

                  <h3 className="font-semibold">
                    {
                      item.user
                        ?.name
                    }
                  </h3>

                  <p className="text-sm text-gray-400">
                    Status:
                    {" "}
                    {item.status}
                  </p>

                </div>

              </div>

              {item.documentUrl && (
                <a
                  href={item.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block mt-4 text-blue-400"
                >
                  View Document
                </a>
              )}

              {item.status?.toLowerCase() === "pending" && (
  <div className="flex gap-3 mt-4">

    <button
      onClick={() =>
        updateStatus(
          item._id,
          "approve"
        )
      }
      className="flex-1 bg-green-600 py-2 rounded-xl flex items-center justify-center gap-2"
    >
      <CheckCircle size={18} />
      Approve
    </button>

    <button
      onClick={() =>
        updateStatus(
          item._id,
          "reject"
        )
      }
      className="flex-1 bg-red-600 py-2 rounded-xl flex items-center justify-center gap-2"
    >
      <XCircle size={18} />
      Reject
    </button>

  </div>
)}
              )}

            </div>
          )
        )}

      </div>

    </div>
  );
};

export default AdminVerifications;