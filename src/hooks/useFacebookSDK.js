import { useEffect, useState } from "react";

const useFacebookSDK = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.FB) {
      setReady(true);
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "827289671286434",
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });

      setReady(true);
    };

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

  }, []);

  return ready;
};

export default useFacebookSDK;