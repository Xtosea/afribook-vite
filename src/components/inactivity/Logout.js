import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {

    const updateActivity = () => {
      localStorage.setItem(
        "lastActivity",
        Date.now()
      );
    };


    const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("lastActivity");

      navigate("/login");
    };


    // Track user activity
    window.addEventListener(
      "mousemove",
      updateActivity
    );

    window.addEventListener(
      "mousedown",
      updateActivity
    );

    window.addEventListener(
      "keypress",
      updateActivity
    );

    window.addEventListener(
      "scroll",
      updateActivity
    );

    window.addEventListener(
      "touchstart",
      updateActivity
    );


    // Set initial activity
    updateActivity();


    // Check every minute
    const timer = setInterval(() => {

      const lastActivity =
        Number(
          localStorage.getItem(
            "lastActivity"
          )
        );

      const thirtyMinutes =
        30 * 60 * 1000;


      if (
        Date.now() - lastActivity >
        thirtyMinutes
      ) {
        logout();
      }

    }, 60000);


    // cleanup
    return () => {

      window.removeEventListener(
        "mousemove",
        updateActivity
      );

      window.removeEventListener(
        "mousedown",
        updateActivity
      );

      window.removeEventListener(
        "keypress",
        updateActivity
      );

      window.removeEventListener(
        "scroll",
        updateActivity
      );

      window.removeEventListener(
        "touchstart",
        updateActivity
      );

      clearInterval(timer);
    };

  }, [navigate]);


  return null;
};

export default Logout;