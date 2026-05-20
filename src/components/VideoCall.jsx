import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import Peer from "simple-peer";

import { connectSocket } from "../socket";

const VoiceCall = ({
  currentUser,
  selectedUser,
  onClose,
}) => {

  const socket = connectSocket();

  const [stream, setStream] =
    useState(null);

  const [receivingCall, setReceivingCall] =
    useState(false);

  const [callerSignal, setCallerSignal] =
    useState(null);

  const [callAccepted, setCallAccepted] =
    useState(false);

  const [micOn, setMicOn] =
    useState(true);

  const remoteAudio =
    useRef();

  const connectionRef =
    useRef();

  // ================= GET AUDIO =================

  useEffect(() => {

    const startMedia =
      async () => {

        try {

          const currentStream =
            await navigator.mediaDevices.getUserMedia(
              {
                audio: true,
                video: false,
              }
            );

          setStream(
            currentStream
          );

        } catch (err) {

          console.log(err);

          alert(
            "Microphone permission denied"
          );
        }
      };

    startMedia();

    // ================= INCOMING CALL =================

    socket.on(
      "incoming-call",
      (data) => {

        if (
          data.callType ===
          "voice"
        ) {

          setReceivingCall(
            true
          );

          setCallerSignal(
            data.signal
          );
        }
      }
    );

    // ================= CALL ENDED =================

    socket.on(
      "call-ended",
      () => {

        connectionRef.current?.destroy();

        stream
          ?.getTracks()
          .forEach((track) =>
            track.stop()
          );

        onClose();
      }
    );

    return () => {

      socket.off(
        "incoming-call"
      );

      socket.off(
        "call-ended"
      );

      if (stream) {

        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    };

  }, [stream]);

  // ================= CALL USER =================

  const callUser = () => {

    const peer =
      new Peer({
        initiator: true,
        trickle: false,
        stream,
      });

    peer.on(
      "signal",
      (signal) => {

        socket.emit(
          "call-user",
          {
            to:
              selectedUser._id,

            from:
              currentUser,

            signal,

            callType:
              "voice",
          }
        );
      }
    );

    // ================= REMOTE AUDIO =================

    peer.on(
      "stream",
      (
        remoteStream
      ) => {

        if (
          remoteAudio.current
        ) {

          remoteAudio.current.srcObject =
            remoteStream;
        }
      }
    );

    socket.on(
      "call-accepted",
      (signal) => {

        setCallAccepted(
          true
        );

        peer.signal(
          signal
        );
      }
    );

    connectionRef.current =
      peer;
  };

  // ================= ANSWER CALL =================

  const answerCall = () => {

    setCallAccepted(
      true
    );

    const peer =
      new Peer({
        initiator: false,
        trickle: false,
        stream,
      });

    peer.on(
      "signal",
      (signal) => {

        socket.emit(
          "answer-call",
          {
            signal,

            to:
              selectedUser._id,
          }
        );
      }
    );

    peer.on(
      "stream",
      (
        remoteStream
      ) => {

        if (
          remoteAudio.current
        ) {

          remoteAudio.current.srcObject =
            remoteStream;
        }
      }
    );

    peer.signal(
      callerSignal
    );

    connectionRef.current =
      peer;
  };

  // ================= END CALL =================

  const endCall = () => {

    connectionRef.current?.destroy();

    stream
      ?.getTracks()
      .forEach((track) =>
        track.stop()
      );

    socket.emit(
      "end-call",
      {
        to:
          selectedUser._id,
      }
    );

    onClose();
  };

  // ================= TOGGLE MIC =================

  const toggleMic = () => {

    stream
      ?.getAudioTracks()
      .forEach((track) => {

        track.enabled =
          !track.enabled;
      });

    setMicOn(
      !micOn
    );
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-950 to-black z-50 flex flex-col items-center justify-center text-white">

      {/* ================= AUDIO ELEMENT ================= */}

      <audio
        ref={remoteAudio}
        autoPlay
      />

      {/* ================= USER INFO ================= */}

      <div className="flex flex-col items-center">

        <img
          src={
            selectedUser?.profilePic ||
            "https://via.placeholder.com/150"
          }
          alt=""
          className="w-36 h-36 rounded-full object-cover border-4 border-gray-700 shadow-2xl"
        />

        <h2 className="text-3xl font-bold mt-6">
          {
            selectedUser?.name
          }
        </h2>

        <p className="text-gray-400 mt-2">
          {callAccepted
            ? "Voice call connected"
            : receivingCall
            ? "Incoming voice call..."
            : "Calling..."}
        </p>
      </div>

      {/* ================= CONTROLS ================= */}

      <div className="flex gap-5 mt-16 flex-wrap justify-center">

        {!callAccepted && (
          <button
            onClick={
              callUser
            }
            className="bg-green-500 px-8 py-4 rounded-full text-white font-bold text-lg shadow-lg"
          >
            Start Voice Call
          </button>
        )}

        {receivingCall &&
          !callAccepted && (

            <button
              onClick={
                answerCall
              }
              className="bg-blue-500 px-8 py-4 rounded-full text-white font-bold text-lg shadow-lg"
            >
              Answer
            </button>
          )}

        {/* MIC */}

        <button
          onClick={
            toggleMic
          }
          className={`w-16 h-16 rounded-full text-2xl flex items-center justify-center shadow-lg ${
            micOn
              ? "bg-gray-700"
              : "bg-red-500"
          }`}
        >
          {micOn
            ? "🎤"
            : "🔇"}
        </button>

        {/* END */}

        <button
          onClick={
            endCall
          }
          className="w-16 h-16 rounded-full bg-red-600 text-2xl flex items-center justify-center shadow-lg"
        >
          📞
        </button>

      </div>
    </div>
  );
};

export default VoiceCall;