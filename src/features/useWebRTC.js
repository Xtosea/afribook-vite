import { useEffect, useRef, useState } from "react";

import {
  createPeerConnection,
  getLocalStream,
  addLocalTracks,
  stopStream,
  closePeer,
  CALL_TIMEOUT,
} from "./rtc";

const useWebRTC = ({
  currentUser,
  selectedUser,
  socket,
  video = false,
}) => {

  // ==========================
  // STATE
  // ==========================

  const [localStream, setLocalStream] =
    useState(null);

  const [remoteStream, setRemoteStream] =
    useState(null);

  const [receivingCall, setReceivingCall] =
    useState(false);

  const [callAccepted, setCallAccepted] =
    useState(false);

  const [connectionState, setConnectionState] =
    useState("idle");

  const [caller, setCaller] =
    useState(null);

  const [callerSignal, setCallerSignal] =
    useState(null);

  const [micEnabled, setMicEnabled] =
    useState(true);

  const [cameraEnabled, setCameraEnabled] =
    useState(video);

  const [callStartedAt, setCallStartedAt] =
    useState(null);

  // ==========================
  // REFS
  // ==========================

  const peerRef =
    useRef(null);

  const timeoutRef =
    useRef(null);

  const remoteCandidatesRef =
    useRef([]);

  // ==========================
  // GET USER MEDIA
  // ==========================

  useEffect(() => {

    let mounted = true;

    const initMedia =
      async () => {

        try {

          const stream =
            await getLocalStream({
              video,
              audio: true,
            });

          if (!mounted) return;

          setLocalStream(stream);

        } catch (err) {

          console.error(
            "Microphone/Camera error:",
            err
          );

        }

      };

    initMedia();

    return () => {

      mounted = false;

      if (localStream) {
        stopStream(localStream);
      }

    };

  }, []);

  // ==========================
  // CREATE PEER
  // ==========================

  const createPeer =
    () => {

      if (peerRef.current) {
        return peerRef.current;
      }

      const peer =
        createPeerConnection();

      peer.ontrack =
        (event) => {

          const stream =
            event.streams[0];

          if (stream) {

            setRemoteStream(stream);

          }

        };

      peer.onconnectionstatechange =
        () => {

          setConnectionState(
            peer.connectionState
          );

          if (
            peer.connectionState ===
            "connected"
          ) {

            setCallAccepted(true);

            setCallStartedAt(
              Date.now()
            );

            clearTimeout(
              timeoutRef.current
            );

          }

          if (
            peer.connectionState ===
            "failed"
          ) {

            endCall();

          }

          if (
            peer.connectionState ===
            "closed"
          ) {

            endCall();

          }

        };

      peer.onicecandidate =
        (event) => {

          if (
            event.candidate &&
            selectedUser
          ) {

            socket.emit(
              "ice-candidate",
              {
                to:
                  selectedUser._id,

                from:
                  currentUser._id,

                candidate:
                  event.candidate,
              }
            );

          }

        };

      peerRef.current =
        peer;

      return peer;

    };

  // ==========================
  // SOCKET LISTENERS
  // ==========================

  useEffect(() => {

    const handleIncomingCall =
      ({
        from,
        signal,
      }) => {

        setReceivingCall(true);

        setCaller(from);

        setCallerSignal(signal);

      };

    const handleAccepted =
      async (
        signal
      ) => {

        if (
          !peerRef.current
        )
          return;

        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(
            signal
          )
        );

      };

    const handleIce =
      async ({
        candidate,
      }) => {

        if (
          peerRef.current &&
          peerRef.current
            .remoteDescription
        ) {

          try {

            await peerRef.current.addIceCandidate(
              new RTCIceCandidate(
                candidate
              )
            );

          } catch (err) {

            console.error(
              err
            );

          }

        } else {

          remoteCandidatesRef.current.push(
            candidate
          );

        }

      };

    socket.on(
      "incoming-call",
      handleIncomingCall
    );

    socket.on(
      "call-accepted",
      handleAccepted
    );

    socket.on(
      "ice-candidate",
      handleIce
    );

    return () => {

      socket.off(
        "incoming-call",
        handleIncomingCall
      );

      socket.off(
        "call-accepted",
        handleAccepted
      );

      socket.off(
        "ice-candidate",
        handleIce
      );

    };

  }, [
    socket,
    selectedUser,
    currentUser,
  ]);

  // ====================================================
  // PART 2 STARTS HERE
  // callUser()
  // answerCall()
  // Remote ICE handling
  // Connection timeout
  // ====================================================


