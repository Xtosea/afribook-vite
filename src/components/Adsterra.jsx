import { useEffect } from "react";

export default function Adsterra({
  containerId,
}) {

  useEffect(() => {

    // CLEAR OLD CONTENT
    const container =
      document.getElementById(
        containerId
      );

    if (container) {
      container.innerHTML = "";
    }

    // CREATE SCRIPT EVERY TIME
    const script =
      document.createElement(
        "script"
      );

    script.async = true;

    script.setAttribute(
      "data-cfasync",
      "false"
    );

    script.src =
      "https://pl29467278.effectivecpmnetwork.com/1ac49ab91139c0ad3e13572497cfbe18/invoke.js";

    // APPEND SCRIPT INSIDE CONTAINER
    container?.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };

  }, [containerId]);

  return (
    <div
      className="
        bg-white
        rounded-2xl
        shadow
        p-2
        overflow-hidden
        min-h-[100px]
      "
    >
      <p className="text-xs text-gray-400 mb-2">
        Sponsored
      </p>

      <div id={containerId}></div>
    </div>
  );
}