import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

const useCallSounds = () => {

  // ===============================
  // AUDIO REFS
  // ===============================

  const ringtoneRef =
    useRef(new Audio("/sounds/ringtone.mp3"));

  const callingRef =
    useRef(new Audio("/sounds/calling.mp3"));

  // ===============================
  // INITIALIZE
  // ===============================

  useEffect(() => {

    ringtoneRef.current.loop = true;

    callingRef.current.loop = true;

    ringtoneRef.current.preload = "auto";

    callingRef.current.preload = "auto";

    return () => {

      ringtoneRef.current.pause();
      callingRef.current.pause();

      ringtoneRef.current.currentTime = 0;
      callingRef.current.currentTime = 0;

    };

  }, []);

  // ===============================
  // RINGTONE
  // ===============================

  const playRingtone =
    useCallback(async () => {

      try {

        ringtoneRef.current.currentTime = 0;

        await ringtoneRef.current.play();

      } catch (err) {

        console.warn(
          "Unable to play ringtone:",
          err
        );

      }

    }, []);

  const stopRingtone =
    useCallback(() => {

      ringtoneRef.current.pause();

      ringtoneRef.current.currentTime = 0;

    }, []);

  // ===============================
  // CALLING TONE
  // ===============================

  const playCalling =
    useCallback(async () => {

      try {

        callingRef.current.currentTime = 0;

        await callingRef.current.play();

      } catch (err) {

        console.warn(
          "Unable to play calling tone:",
          err
        );

      }

    }, []);

  const stopCalling =
    useCallback(() => {

      callingRef.current.pause();

      callingRef.current.currentTime = 0;

    }, []);

  // ===============================
  // STOP ALL
  // ===============================

  const stopAllSounds =
    useCallback(() => {

      stopCalling();

      stopRingtone();

    }, [
      stopCalling,
      stopRingtone,
    ]);

  // ===============================
  // EXPORT
  // ===============================

  return {

    playRingtone,
    stopRingtone,

    playCalling,
    stopCalling,

    stopAllSounds,

  };

};

export default useCallSounds;