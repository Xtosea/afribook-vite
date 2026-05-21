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
    <div className="fixed bottom-6 right-10 z-[9999]">
      <button
        onClick={handleInstall}
        className="bg-blue-600 text-white px-4 py-3 rounded-full shadow-xl"
      >
        Install App
      </button>
    </div>
  );
}