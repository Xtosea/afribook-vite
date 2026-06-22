import { useEffect } from "react";

export default function SponsoredAd() {
  useEffect(() => {
    const script = document.createElement("script");

    script.src =
      "https://pl29467278.effectivecpmnetwork.com/1ac49ab91139c0ad3e13572497cfbe18/invoke.js";

    script.async = true;
    script.setAttribute("data-cfasync", "false");

    document
      .getElementById("ad-slot")
      ?.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div
      id="ad-slot"
      className="w-full flex justify-center my-2"
    />
  );
}