import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import Peer from "simple-peer";
import { connectSocket } from "../socket";

const VideoCall = ({
  currentUser,
  selectedUser,
  onClose,
}) => {

  const socket = useRef(
    connectSocket()
  ).current;

  // =========================
  // STATE
  // =========================

  const [stream, setStream] =
    useState(null);

  const [receivingCall, setReceivingCall] =
    useState(false);

  const [callerSignal, setCallerSignal] =
    useState(null);

  const [caller, setCaller] =
    useState(null);

  const [callAccepted, setCallAccepted] =
    useState(false);

  const [micOn, setMicOn] =
    useState(true);

  const [cameraOn, setCameraOn] =
    useState(true);

  // =========================
  // REFS
  // =========================

  const myVideo =
    useRef(null);

  const userVideo =
    useRef(null);

  const connectionRef =
    useRef(null);

  const ringtoneRef =
    useRef(null);

  const callingRef =
    useRef(null);

  // =========================
  // GET CAMERA & MIC
  // =========================

  useEffect(() => {

    let localStream;

    const startMedia = async () => {

      try {

        localStream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

        setStream(localStream);

        if (myVideo.current) {
          myVideo.current.srcObject =
            localStream;
        }

      } catch (err) {

        console.log(
          "Media error:",
          err
        );

        alert(
          "Camera or microphone permission denied."
        );

        onClose();

      }

    };

    startMedia();

    return () => {

      if (localStream) {

        localStream
          .getTracks()
          .forEach(track =>
            track.stop()
          );

      }

    };

  }, [onClose]);

  // =========================
  // HANDLE INCOMING CALL
  // =========================

  const handleIncomingCall =
    (data) => {

      if (
        data.callType !== "video"
      ) return;

      setReceivingCall(true);

      setCaller(
        data.from
      );

      setCallerSignal(
        data.signal
      );

      ringtoneRef.current
        ?.play()
        .catch(err =>
          console.log(
            "Ringtone blocked:",
            err
          )
        );

    };

  // =========================
  // SOCKET EVENTS
  // =========================

  useEffect(() => {

    const handleAccepted =
      (signal) => {

        setCallAccepted(true);

        callingRef.current?.pause();

        if (callingRef.current) {
          callingRef.current.currentTime = 0;
        }

        connectionRef.current
          ?.signal(signal);

      };

    const handleEnded =
      () => {

        connectionRef.current
          ?.destroy();

        connectionRef.current =
          null;

        ringtoneRef.current?.pause();
        callingRef.current?.pause();

        if (ringtoneRef.current)
          ringtoneRef.current.currentTime = 0;

        if (callingRef.current)
          callingRef.current.currentTime = 0;

        if (stream) {

          stream
            .getTracks()
            .forEach(track =>
              track.stop()
            );

        }

        onClose();

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
      "call-ended",
      handleEnded
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
        "call-ended",
        handleEnded
      );

    };

  }, [
    socket,
    stream,
    onClose,
  ]);

  // =========================
  // CREATE PEER
  // =========================

  const createPeer = (
    initiator,
    mediaStream
  ) => {

    const peer =
      new Peer({

        initiator,

        trickle: false,

        stream:
          mediaStream,

        config: {

          iceServers: [

            {
              urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
              ],
            },

          ],

        },

      });

    peer.on(
      "stream",
      remoteStream => {

        if (
          userVideo.current
        ) {

          userVideo.current.srcObject =
            remoteStream;

        }

      }
    );

    peer.on(
      "error",
      err => {

        console.log(
          "Peer error:",
          err
        );

      }
    );

    peer.on(
      "close",
      () => {

        console.log(
          "Peer closed"
        );

      }
    );

    return peer;

  };