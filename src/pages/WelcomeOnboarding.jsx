import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function WelcomeOnboarding() {

  const navigate = useNavigate();

  useEffect(() => {

    const script1 = document.createElement("script");

    script1.innerHTML = `
      atOptions = {
        'key' : '682c7f724231a50f97aebde0e408fce5',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;

    const script2 = document.createElement("script");

    script2.src =
      "https://www.highperformanceformat.com/682c7f724231a50f97aebde0e408fce5/invoke.js";

    script2.async = true;

    const container =
      document.getElementById("onboarding-ad");

    if (
      container &&
      container.childNodes.length === 0
    ) {
      container.appendChild(script1);
      container.appendChild(script2);
    }

  }, []);

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
  Jump into AfricSocial and start connecting instantly 🚀
</p>

        <p className="text-gray-600 mb-6">
          Your account is ready!
        </p>

        {/* FEATURES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-6">

          {/* cards */}

        </div>

        {/* BUTTONS */}
<div className="space-y-3 pb-24">

  <button
    onClick={() => navigate("/")}
    className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
  >
    Go to Home 🏠
  </button>

  <button
    onClick={() => navigate("/messages")}
    className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
  >
    Messages 💬
  </button>

  <button
    onClick={() => navigate("/sync-contacts")}
    className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold"
  >
    Sync Contacts 📱
  </button>

  <button
    onClick={() => navigate("/SuggestedFriends")}
    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
  >
    Find Friends 👥
  </button>

  <button
    onClick={() => navigate("/profile")}
    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
  >
    👤 Edit Profile
  </button>

  <button
    onClick={() => navigate("/")}
    className="text-sm text-gray-500 underline mt-4"
  >
    Continue later
  </button>

</div>
      </div>

    </div>
  );
}