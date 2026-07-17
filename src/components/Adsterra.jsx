import { useEffect } from "react";

export default function Adsterra({
  containerId,
  scriptSrc = "https://pl30399675.effectivecpmnetwork.com/30af2dea6856ea569ade869ad6ae2915/invoke.js",
}) {
  useEffect(() => {
    const container = document.getElementById(containerId);

    if (!container || container.dataset.loaded) return;

    container.dataset.loaded = "true";

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = scriptSrc;

    container.appendChild(script);
  }, [containerId, scriptSrc]);

  return <div id={containerId}></div>;
}