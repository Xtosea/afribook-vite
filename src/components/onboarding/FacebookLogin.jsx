import React from "react";
import { API_BASE } from "../../api/api";
import useFacebookSDK from "../../hooks/useFacebookSDK";

const FacebookLogin = () => {
  const fbReady = useFacebookSDK();

  const handleFacebookLogin = () => {
    if (!fbReady) return;

    window.FB.login(
      function (response) {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;

          window.FB.api(
            "/me",
            { fields: "name,email,picture" },
            async function (userInfo) {

              const res = await fetch(`${API_BASE}/api/auth/facebook`, {
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
              });

              const data = await res.json();

              if (data.token) {
                localStorage.setItem("token", data.token);
                window.location.href = "/";
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
      className="w-full bg-blue-600 text-white py-2 rounded-lg mt-3"
    >
      {fbReady ? "Continue with Facebook" : "Loading Facebook..."}
    </button>
  );
};

export default FacebookLogin;