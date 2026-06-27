import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import {
  getLocalStream,
  stopStream,
} from "./rtc";

const useMedia = ({
  video = false,
} = {}) => {

  const streamRef = useRef(null);

  const [localStream, setLocalStream] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [micEnabled, setMicEnabled] =
    useState(true);

  const [cameraEnabled, setCameraEnabled] =
    useState(video);

  // ==========================
  // GET MEDIA
  // ==========================

  const startMedia =
    useCallback(async () => {

      try {

        setLoading(true);
        setError(null);

        const stream =
          await getLocalStream({
            audio: true,
            video,
          });

        streamRef.current =
          stream;

        setLocalStream(stream);

        setMicEnabled(true);
        setCameraEnabled(video);

        return stream;

      } catch (err) {

        console.error(
          "Media Error:",
          err
        );

        setError(err);

        return null;

      } finally {

        setLoading(false);

      }

    }, [video]);

  // ==========================
  // STOP MEDIA
  // ==========================

  const stopMedia =
    useCallback(() => {

      if (!streamRef.current)
        return;

      stopStream(
        streamRef.current
      );

      streamRef.current =
        null;

      setLocalStream(null);

    }, []);

  // ==========================
  // TOGGLE MICROPHONE
  // ==========================

  const toggleMic =
    useCallback(() => {

      if (!streamRef.current)
        return;

      const enabled =
        !micEnabled;

      streamRef.current
        .getAudioTracks()
        .forEach(track => {
          track.enabled =
            enabled;
        });

      setMicEnabled(enabled);

    }, [micEnabled]);

  // ==========================
  // TOGGLE CAMERA
  // ==========================

  const toggleCamera =
    useCallback(() => {

      if (!streamRef.current)
        return;

      const enabled =
        !cameraEnabled;

      streamRef.current
        .getVideoTracks()
        .forEach(track => {
          track.enabled =
            enabled;
        });

      setCameraEnabled(enabled);

    }, [cameraEnabled]);

  // ==========================
  // RESTART MEDIA
  // ==========================

  const restartMedia =
    useCallback(async () => {

      stopMedia();

      return await startMedia();

    }, [
      startMedia,
      stopMedia,
    ]);

  // ==========================
  // AUTO START
  // ==========================

  useEffect(() => {

    startMedia();

    return () => {

      stopMedia();

    };

  }, [
    startMedia,
    stopMedia,
  ]);

  return {

    localStream,

    streamRef,

    loading,

    error,

    micEnabled,

    cameraEnabled,

    startMedia,

    stopMedia,

    restartMedia,

    toggleMic,

    toggleCamera,

  };

};

export default useMedia;