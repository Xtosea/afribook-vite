import { useNavigate } from "react-router-dom";

export default function WelcomeOnboarding() {

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">

      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg w-full text-center">

        <div className="text-6xl mb-4">
          🎉
        </div>

        <h1 className="text-3xl font-bold mb-3">
          Welcome to AfricSocial
        </h1>

        <p className="text-gray-600 mb-6">
          Your account is ready! Start connecting,
          sharing and earning on Africa’s fastest
          growing social platform.
        </p>

        {/* FEATURES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-6">

          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="text-xl mb-1">👥</div>

            <h3 className="font-semibold">
              Add Friends
            </h3>

            <p className="text-sm text-gray-500">
              Connect with people you know
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="text-xl mb-1">📱</div>

            <h3 className="font-semibold">
              Sync Contacts
            </h3>

            <p className="text-sm text-gray-500">
              Find friends from your phonebook
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="text-xl mb-1">💰</div>

            <h3 className="font-semibold">
              Earn Points
            </h3>

            <p className="text-sm text-gray-500">
              Get rewarded for engagement
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="text-xl mb-1">🔥</div>

            <h3 className="font-semibold">
              Go Viral
            </h3>

            <p className="text-sm text-gray-500">
              Reach thousands of users
            </p>
          </div>

        </div>

        {/* BUTTONS */}
        <div className="space-y-3">

          <button
            onClick={() => navigate("/sync-contacts")}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Sync Contacts
          </button>

          <button
            onClick={() => navigate("/add-friends")}
            className="w-full border border-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Skip For Now
          </button>

<script>
  atOptions = {
    'key' : '682c7f724231a50f97aebde0e408fce5',
    'format' : 'iframe',
    'height' : 50,
    'width' : 320,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/682c7f724231a50f97aebde0e408fce5/invoke.js"></script>


        </div>

      </div>

    </div>
  );
}