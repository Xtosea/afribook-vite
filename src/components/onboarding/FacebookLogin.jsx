// src/components/onboarding/FacebookLogin.jsx
import React, { useEffect } from "react";
import { API_BASE } from "../../api/api";

const FacebookLogin = () => {

  useEffect(() => {
    // Load Facebook SDK
    if (!window.FB) {
      window.fbAsyncInit = function () {
        FB.init({
          appId: "827289671286434", // your app id
          cookie: true,
          xfbml: true,
          version: "v18.0",
        });
      };

      (function (d, s, id) {
        const fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        const js = d.createElement(s);
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      })(document, "script", "facebook-jssdk");
    }
  }, []);

  const handleFacebookLogin = () => {
    if (!window.FB) return alert("Facebook SDK not loaded yet");

    FB.login(
      function (response) {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;

          FB.api("/me", { fields: "id,name,email,picture" }, async function (userInfo) {
            try {
              const res = await fetch(`${API_BASE}/api/auth/facebook`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
                window.location.href = "/"; // redirect after login
              }
            } catch (err) {
              console.error(err);
              alert("Failed to login with Facebook");
            }
          });
        } else {
          alert("Facebook login failed");
        }
      },
      { scope: "public_profile,email" }
    );
  };

  return (
    <button
      onClick={handleFacebookLogin}
      className="w-full bg-blue-600 text-white py-2 rounded-lg mt-3"
    >
      Continue with Facebook
    </button>
  );
};

export default FacebookLogin;