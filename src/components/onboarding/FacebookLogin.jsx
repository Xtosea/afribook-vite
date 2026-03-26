import React, { useEffect, useState } from "react";
import { API_BASE } from "../../api/api";

const FacebookLogin = () => {
  const [fbReady, setFbReady] = useState(false);

  // Wait for Facebook SDK
  useEffect(() => {
    const checkFB = setInterval(() => {
      if (window.FB) {
        setFbReady(true);
        clearInterval(checkFB);
      }
    }, 500);

    return () => clearInterval(checkFB);
  }, []);

  const handleFacebookLogin = () => {
    if (!window.FB) {
      alert("Facebook SDK not loaded yet");
      return;
    }

    window.FB.login(
      async function (response) {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;

          window.FB.api(
            "/me",
            { fields: "name,email,picture" },
            async function (userInfo) {
              try {
                const res = await fetch(
                  `${API_BASE}/api/auth/facebook`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      name: userInfo.name,
                      email: userInfo.email,
                      profilePic: userInfo.picture.data.url,
                      accessToken,
                    }),
                  }
                );

                const data = await res.json();

                if (data.token) {
                  localStorage.setItem("token", data.token);
                  localStorage.setItem("name", userInfo.name);
                  localStorage.setItem(
                    "profilePic",
                    userInfo.picture.data.url
                  );

                  window.location.href = "/";
                }
              } catch (err) {
                console.error(err);
              }
            }
          );
        }
      },
      { scope: "public_profile,email" }
    );
  };

  return (
    <button
      onClick={handleFacebookLogin}
      disabled={!fbReady}
      className="w-full bg-blue-600 text-white py-2 rounded-lg mt-3 disabled:opacity-50"
    >
      {fbReady ? "Continue with Facebook" : "Loading Facebook..."}
    </button>
  );
};

export default FacebookLogin;