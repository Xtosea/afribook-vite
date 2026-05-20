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

  const [cameraOn, setCameraOn] =
    useState(true);

  const myVideo = useRef();

  const userVideo = useRef();

  const connectionRef =
    useRef();

  // ================= GET CAMERA + MIC =================

  useEffect(() => {

    const startMedia =
      async () => {

        try {

          const currentStream =
            await navigator.mediaDevices.getUserMedia(
              {
                video: true,
                audio: true,
              }
            );

          setStream(
            currentStream
          );

          if (
            myVideo.current
          ) {
            myVideo.current.srcObject =
              currentStream;
          }

        } catch (err) {

          console.log(err);

          alert(
            "Camera or microphone permission denied"
          );
        }
      };

    startMedia();

    // ================= INCOMING CALL =================

    socket.on(
      "incoming-call",
      (data) => {

        setReceivingCall(
          true
        );

        setCallerSignal(
          data.signal
        );
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
          userVideo.current
        ) {
          userVideo.current.srcObject =
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
          userVideo.current
        ) {
          userVideo.current.srcObject =
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

  // ================= TOGGLE CAMERA =================

  const toggleCamera =
    () => {

      stream
        ?.getVideoTracks()
        .forEach(
          (track) => {

            track.enabled =
              !track.enabled;
          }
        );

      setCameraOn(
        !cameraOn
      );
    };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">

      {/* ================= TOP ================= */}

      <div className="flex justify-between items-center p-4 text-white border-b border-gray-800">

        <div>

          <h2 className="text-xl font-bold">
            Video Call
          </h2>

          <p className="text-sm text-gray-400">
            {
              selectedUser?.name
            }
          </p>

        </div>

        <button
          onClick={
            endCall
          }
          className="bg-red-500 px-4 py-2 rounded-full"
        >
          End
        </button>
      </div>

      {/* ================= VIDEOS ================= */}

      <div className="flex-1 grid md:grid-cols-2 gap-4 p-4">

        {/* MY VIDEO */}

        <video
          playsInline
          muted
          ref={myVideo}
          autoPlay
          className="w-full h-full object-cover rounded-2xl bg-gray-900"
        />

        {/* USER VIDEO */}

        <video
          playsInline
          ref={userVideo}
          autoPlay
          className="w-full h-full object-cover rounded-2xl bg-gray-900"
        />
      </div>

      {/* ================= CONTROLS ================= */}

      <div className="p-6 flex flex-wrap justify-center gap-4">

        {!callAccepted && (
          <button
            onClick={
              callUser
            }
            className="bg-green-500 px-6 py-3 rounded-full text-white font-bold"
          >
            Start Call
          </button>
        )}

        {receivingCall &&
          !callAccepted && (

            <button
              onClick={
                answerCall
              }
              className="bg-blue-500 px-6 py-3 rounded-full text-white font-bold"
            >
              Answer Call
            </button>
          )}

        {/* MIC */}

        <button
          onClick={
            toggleMic
          }
          className={`px-5 py-3 rounded-full text-white font-bold ${
            micOn
              ? "bg-gray-700"
              : "bg-red-500"
          }`}
        >
          {micOn
            ? "🎤"
            : "🔇"}
        </button>

        {/* CAMERA */}

        <button
          onClick={
            toggleCamera
          }
          className={`px-5 py-3 rounded-full text-white font-bold ${
            cameraOn
              ? "bg-gray-700"
              : "bg-red-500"
          }`}
        >
          {cameraOn
            ? "📷"
            : "🚫"}
        </button>

        {/* END CALL */}

        <button
          onClick={
            endCall
          }
          className="bg-red-600 px-6 py-3 rounded-full text-white font-bold"
        >
          End Call
        </button>

      </div>
    </div>
  );
};

export default VideoCall;