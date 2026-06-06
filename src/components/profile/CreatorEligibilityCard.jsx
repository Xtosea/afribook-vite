import React from "react";

const CreatorEligibilityCard = ({
  data,
}) => {

  const followerProgress =
    Math.min(
      (
        data.followers /
        data.requirements.followers
      ) * 100,
      100
    );

  const viewsProgress =
    Math.min(
      (
        data.views /
        data.requirements.views
      ) * 100,
      100
    );

  return (
  <div className="bg-gray-900 text-white p-4 rounded-2xl">

    <h3 className="font-bold text-lg mb-4">
      AfricSocial Partner Program
    </h3>

    {/* Followers Progress */}

    {/* Views Progress */}

    {/* Account Age */}

    {/* Violations */}

    {/* Apply Button */}

    {/* POLICY SECTION */}
    <div className="mt-6 border-t border-gray-700 pt-4">

      <h4 className="font-bold mb-2">
        Partner Rules
      </h4>

      <ul className="list-disc ml-5 text-sm text-gray-300 space-y-1">

        <li>
          No fake engagement
        </li>

        <li>
          No spam content
        </li>

        <li>
          No copyright violations
        </li>

        <li>
          No adult content
        </li>

        <li>
          No misleading ads
        </li>

      </ul>

    </div>

  </div>
);

      <p>
        Followers:
        {" "}
        {data.followers}
        /
        {
          data.requirements
            .followers
        }
      </p>

      <div className="bg-gray-700 h-2 rounded">
        <div
          className="bg-green-500 h-2 rounded"
          style={{
            width:
              `${followerProgress}%`,
          }}
        />
      </div>

      <p className="mt-3">
        Views:
        {" "}
        {data.views}
        /
        {
          data.requirements.views
        }
      </p>

      <div className="bg-gray-700 h-2 rounded">
        <div
          className="bg-blue-500 h-2 rounded"
          style={{
            width:
              `${viewsProgress}%`,
          }}
        />
      </div>

      <p className="mt-3">
        Account Age:
        {data.accountAge} days
      </p>

      <p>
        Policy Violations:
        {data.violations}
      </p>

      {data.eligible ? (
        <button
          className="mt-4 bg-green-600 px-4 py-2 rounded"
        >
          Apply For Monetization
        </button>
      ) : (
        <div className="mt-4 text-yellow-400">
          Complete all requirements
          to apply.
        </div>
      )}
    </div>
  );
};

export default CreatorEligibilityCard;