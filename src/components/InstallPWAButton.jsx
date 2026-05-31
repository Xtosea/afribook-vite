import React, { useEffect, useState } from "react";

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState(null);

  const [showButton, setShowButton] =
    useState(true);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handler
    );

    const appInstalledHandler = () => {
      setShowButton(false);

      console.log(
        "AfriBook app installed"
      );
    };

    window.addEventListener(
      "appinstalled",
      appInstalledHandler
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handler
      );

      window.removeEventListener(
        "appinstalled",
        appInstalledHandler
      );
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();

      const choiceResult =
        await deferredPrompt.userChoice;

      if (
        choiceResult.outcome ===
        "accepted"
      ) {
        console.log(
          "User accepted install"
        );
      } else {
        console.log(
          "User dismissed install"
        );
      }

      setDeferredPrompt(null);

    } else {

      alert(
        "To install AfriBook, tap Chrome menu ⋮ and select 'Add to Home Screen'."
      );
    }
  };

  if (!showButton) return null;

  return (
    <div className="fixed bottom-[600px]  left-1/2 -translate-x-1/2 z-[9999]">
  <button
  onClick={handleInstall}
  className="
    bg-blue-600
    text-white
    w-14
    h-14
    rounded-full
    shadow-xl
    flex
    flex-col
    items-center
    justify-center
    text-xs
    font-semibold
    leading-tight
    -ml-4
  "
>
  <span>Install</span>
  <span>App</span>
</button>
</div>
  );
}