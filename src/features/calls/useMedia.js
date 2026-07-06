import { useState, useRef, useCallback, useEffect } from "react";

const useMedia = () => {
  const [localStream, setLocalStream] = useState(null);

  const [micEnabled, setMicEnabled] =
    useState(true);

  const [cameraEnabled, setCameraEnabled] =
    useState(true);

  const streamRef = useRef(null);

  // ===============================
  // START MEDIA
  // ===============================

  const startMedia = useCallback(
    async ({ video = false } = {}) => {
      try {
        // Stop any previous stream first
        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track) => track.stop());

          streamRef.current = null;
        }

        const stream =
          await navigator.mediaDevices.getUserMedia({
            audio: true,
            video,
          });

        streamRef.current = stream;

        setLocalStream(stream);

        const audioTrack =
          stream.getAudioTracks()[0];

        const videoTrack =
          stream.getVideoTracks()[0];

        setMicEnabled(
          audioTrack ? audioTrack.enabled : false
        );

        setCameraEnabled(
          videoTrack ? videoTrack.enabled : false
        );

        return stream;
      } catch (err) {
        console.error(
          "getUserMedia failed:",
          err
        );

        throw err;
      }
    },
    []
  );

  // ===============================
  // STOP MEDIA
  // ===============================

  const stopMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    setLocalStream(null);

    setMicEnabled(false);

    setCameraEnabled(false);
  }, []);

  // ===============================
  // TOGGLE MICROPHONE
  // ===============================

  const toggleMic = useCallback(() => {
    if (!streamRef.current) return;

    streamRef.current
      .getAudioTracks()
      .forEach((track) => {
        track.enabled = !track.enabled;

        setMicEnabled(track.enabled);
      });
  }, []);

  // ===============================
  // TOGGLE CAMERA
  // ===============================

  const toggleCamera = useCallback(() => {
    if (!streamRef.current) return;

    const tracks =
      streamRef.current.getVideoTracks();

    if (!tracks.length) return;

    tracks.forEach((track) => {
      track.enabled = !track.enabled;

      setCameraEnabled(track.enabled);
    });
  }, []);

  // ===============================
  // CLEANUP
  // ===============================

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }
    };
  }, []);

  // ===============================
  // RETURN
  // ===============================

  return {
  localStream,
  microphoneEnabled: micEnabled,
  cameraEnabled,
  startMedia,
  stopMedia,
  toggleMicrophone: toggleMic,
  toggleCamera,
};
};

export default useMedia;