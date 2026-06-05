import React,
{
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";

import {
  API_BASE,
} from "../../api/api";

const AdminFraud = () => {

  const [fraud,
    setFraud] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

  const token =
    localStorage.getItem("token");

  const fetchFraud =
    async () => {

      try {

        const res =
          await fetch(
            `${API_BASE}/api/admin/fraud`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        setFraud(data);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {
    fetchFraud();
  }, []);

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

        <h1 className="text-2xl font-bold flex items-center gap-2">

          <AlertTriangle />

          Fraud Detection

        </h1>

        <button
          onClick={
            fetchFraud
          }
        >
          <RefreshCcw />
        </button>

      </div>

      {/* Excessive Views */}

      <div className="bg-gray-900 rounded-xl p-4 mb-4">

        <h2 className="font-bold mb-3">
          Excessive Views
        </h2>

        {fraud?.excessiveViews
          ?.length === 0 && (
          <p>
            No suspicious views
          </p>
        )}

        {fraud?.excessiveViews?.map(
          item => (
            <div
              key={item._id}
            >
              User:
              {" "}
              {item._id}
              {" "}
              •
              {" "}
              {item.views}
              {" "}
              views
            </div>
          )
        )}

      </div>

      {/* Excessive Clicks */}

      <div className="bg-gray-900 rounded-xl p-4 mb-4">

        <h2 className="font-bold mb-3">
          Excessive Clicks
        </h2>

        {fraud?.excessiveClicks
          ?.length === 0 && (
          <p>
            No suspicious clicks
          </p>
        )}

        {fraud?.excessiveClicks?.map(
          item => (
            <div
              key={item._id}
            >
              User:
              {" "}
              {item._id}
              {" "}
              •
              {" "}
              {item.clicks}
              {" "}
              clicks
            </div>
          )
        )}

      </div>

      {/* Self Clicks */}

      <div className="bg-gray-900 rounded-xl p-4">

        <h2 className="font-bold mb-3">
          Self Clicks
        </h2>

        {fraud?.selfClicks
          ?.length === 0 && (
          <p>
            No self-click fraud
          </p>
        )}

        {fraud?.selfClicks?.map(
          item => (

            <div
              key={item._id}
              className="flex gap-3 items-center mb-3"
            >

              <img
                src={
                  item.viewer
                    ?.profilePic
                }
                alt=""
                className="w-10 h-10 rounded-full"
              />

              <span>
                {
                  item.viewer
                    ?.name
                }
              </span>

            </div>
          )
        )}

      </div>

    </div>
  );
};

export default AdminFraud;
