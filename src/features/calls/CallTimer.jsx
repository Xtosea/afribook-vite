import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

const formatTime = (seconds) => {

  const mins =
    Math.floor(seconds / 60);

  const secs =
    seconds % 60;

  return `${String(mins).padStart(
    2,
    "0"
  )}:${String(secs).padStart(
    2,
    "0"
  )}`;

};

const CallTimer = ({
  callStartedAt,
}) => {

  const [seconds, setSeconds] =
    useState(0);

  useEffect(() => {

    if (!callStartedAt) {

      setSeconds(0);

      return;

    }

    const updateTimer = () => {

      const elapsed =
        Math.floor(
          (Date.now() -
            callStartedAt) /
            1000
        );

      setSeconds(elapsed);

    };

    updateTimer();

    const interval =
      setInterval(
        updateTimer,
        1000
      );

    return () => {

      clearInterval(
        interval
      );

    };

  }, [callStartedAt]);

  return (

    <div className="text-center">

      <span className="text-green-400 text-lg font-semibold">

        {callStartedAt
          ? formatTime(seconds)
          : "00:00"}

      </span>

    </div>

  );

};

export default CallTimer;