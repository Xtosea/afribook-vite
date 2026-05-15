import React, { useEffect, useState } from "react";

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(true); // always show for demo

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault(); // Prevent automatic prompt
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const appInstalledHandler = () => {
      setShowButton(false);
      console.log("JobLink app installed");
    };
    window.addEventListener("appinstalled", appInstalledHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // show native install prompt
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
      setDeferredPrompt(null);
    } else {
      // fallback: manual info if no beforeinstallprompt
      alert(
        "To install JobLink, tap ⋮ in Chrome and select 'Add to Home screen'."
      );
    }
    setShowButton(false);
  };

  if (!showButton) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleInstall}
        className="bg-brand text-white px-4 py-2 rounded shadow-lg"
      >
        Install JobLink App
      </button>
    </div>
  );
}