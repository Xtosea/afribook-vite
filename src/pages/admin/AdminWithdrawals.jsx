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

const AdminWithdrawals = () => {

  const [withdrawals, setWithdrawals] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const token =
    localStorage.getItem("token");

  const fetchWithdrawals =
    async () => {
      try {

        setLoading(true);

        const res =
          await fetch(
            `${API_BASE}/api/admin/withdrawals`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setWithdrawals(data);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const updateStatus =
    async (
      id,
      action
    ) => {
      try {

        const res =
          await fetch(
            `${API_BASE}/api/admin/withdrawals/${id}/${action}`,
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

        fetchWithdrawals();

      } catch (err) {

        console.error(err);
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold">
          Withdrawals
        </h1>

        <button
          onClick={fetchWithdrawals}
          className="bg-gray-800 p-2 rounded-full"
        >
          <RefreshCcw size={18} />
        </button>

      </div>

      <div className="space-y-4">

        {withdrawals.length === 0 && (
          <div className="bg-gray-900 p-4 rounded-xl">
            No withdrawals found
          </div>
        )}

        {withdrawals.map(
          (withdrawal) => (
            <div
              key={withdrawal._id}
              className="bg-gray-900 rounded-2xl p-4"
            >

              <div className="flex items-center gap-3">

                <img
                  src={
                    withdrawal.user
                      ?.profilePic ||
                    "/default-avatar.png"
                  }
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div>

                  <h3 className="font-semibold">
                    {
                      withdrawal.user
                        ?.name
                    }
                  </h3>

                  <p className="text-sm text-gray-400">
                    ₦
                    {withdrawal.amount?.toLocaleString()}
                  </p>

                </div>

              </div>

              <div className="mt-4 text-sm text-gray-400 space-y-1">

                <p>
                  Bank:
                  {" "}
                  {
                    withdrawal.bankName
                  }
                </p>

                <p>
                  Account Name:
                  {" "}
                  {
                    withdrawal.accountName
                  }
                </p>

                <p>
                  Account Number:
                  {" "}
                  {
                    withdrawal.accountNumber
                  }
                </p>

                <p>
                  Status:
                  {" "}
                  <span className="capitalize">
                    {
                      withdrawal.status
                    }
                  </span>
                </p>

                <p>
                  Type:
                  {" "}
                  <span className="capitalize">
                    {
                      withdrawal.type ||
                      "points"
                    }
                  </span>
                </p>

              </div>

              {withdrawal.status ===
                "pending" && (
                <div className="flex gap-3 mt-4">

                  <button
                    onClick={() =>
                      updateStatus(
                        withdrawal._id,
                        "approve"
                      )
                    }
                    className="flex-1 bg-green-600 py-2 rounded-xl flex items-center justify-center gap-2"
                  >
                    <CheckCircle
                      size={18}
                    />
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        withdrawal._id,
                        "reject"
                      )
                    }
                    className="flex-1 bg-red-600 py-2 rounded-xl flex items-center justify-center gap-2"
                  >
                    <XCircle
                      size={18}
                    />
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

export default AdminWithdrawals;