import { useEffect } from "react";

export default function BannerAd({ containerId }) {
  useEffect(() => {
    const existingScript = document.querySelector(
      `script[src="https://pl29467278.effectivecpmnetwork.com/1ac49ab91139c0ad3e13572497cfbe18/invoke.js"]`
    );

    // Prevent loading script multiple times
    if (!existingScript) {
      const script = document.createElement("script");

      script.async = true;
      script.setAttribute("data-cfasync", "false");

      script.src =
        "https://pl29467278.effectivecpmnetwork.com/1ac49ab91139c0ad3e13572497cfbe18/invoke.js";

      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow p-2 overflow-hidden">
      <p className="text-xs text-gray-400 mb-2">
        Sponsored
      </p>

      <div id={containerId}></div>
    </div>
  );
}