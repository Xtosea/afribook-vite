import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function InactivityLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    let timeout;

    const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");

      alert(
        "You have been logged out due to inactivity."
      );

      navigate("/login");
    };

    const resetTimer = () => {
      clearTimeout(timeout);

      timeout = setTimeout(
        logout,
        30 * 60 * 1000 // 30 minutes
      );
    };

    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) =>
      window.addEventListener(
        event,
        resetTimer
      )
    );

    resetTimer();

    return () => {
      clearTimeout(timeout);

      events.forEach((event) =>
        window.removeEventListener(
          event,
          resetTimer
        )
      );
    };
  }, [navigate]);

  return null;
}

export default InactivityLogout;