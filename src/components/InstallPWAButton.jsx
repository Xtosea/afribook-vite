import React, { useEffect, useState } from "react";

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const isIOS = /iphone|ipad|ipod/i.test(
    navigator.userAgent
  );

  useEffect(() => {
    const checkInstalled = () => {
      const standalone =
        window.matchMedia(
          "(display-mode: standalone)"
        ).matches ||
        window.navigator.standalone === true;

      setIsInstalled(standalone);
    };

    checkInstalled();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      checkInstalled();
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } =
      await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  // Hide if already installed
  if (isInstalled) return null;

  // Chrome, Edge, Brave, Opera, Samsung Internet
  if (deferredPrompt) {
    return (
      <div className="fixed bottom-[605px] left-1/2 -translate-x-1/2 z-[9999]">
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

  // iPhone / iPad Safari
  if (isIOS) {
    return (
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999]">
        <div
          className="
            bg-black
            text-white
            px-4
            py-3
            rounded-xl
            shadow-xl
            text-sm
            max-w-xs
            text-center
          "
        >
          Tap Share ⬆️ then
          <br />
          <strong>Add to Home Screen</strong>
        </div>
      </div>
    );
  }

  return null;
}