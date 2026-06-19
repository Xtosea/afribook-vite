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

  const [caller, setCaller] =
    useState(null);

  const myVideo =
    useRef(null);

  const userVideo =
    useRef(null);

  const connectionRef =
    useRef(null);

  // ================= GET CAMERA + MIC =================

  useEffect(() => {
  let currentStream;

  const startMedia = async () => {
    try {
      currentStream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      setStream(currentStream);

      if (myVideo.current) {
        myVideo.current.srcObject =
          currentStream;
      }
    } catch (err) {
      console.log(err);
    }
  };

  startMedia();

  return () => {
    currentStream
      ?.getTracks()
      .forEach(track => track.stop());
  };
}, []);

  // ================= SOCKET EVENTS =================

  useEffect(() => {

    const handleIncomingCall =
      (data) => {

        if (
          data.callType ===
          "video"
        ) {

          setReceivingCall(
            true
          );

          setCallerSignal(
            data.signal
          );

          setCaller(
            data.from
          );
        }
      };

    const handleCallAccepted =
      (signal) => {

        setCallAccepted(
          true
        );

        connectionRef.current?.signal(
          signal
        );
      };

    const handleCallEnded =
      () => {

        cleanupCall();
      };

  socket.on(
  "call-ended",
  handleCallEnded
);

socket.on(
  "connect",
  () => {
    console.log(
      "Socket ready for WebRTC"
    );
  }
);
    socket.on(
      "incoming-call",
      handleIncomingCall
    );

    socket.on(
      "call-accepted",
      handleCallAccepted
    );

    socket.on(
      "call-ended",
      handleCallEnded
    );

    return () => {

      socket.off(
        "incoming-call",
        handleIncomingCall
      );

      socket.off(
        "call-accepted",
        handleCallAccepted
      );

      socket.off(
        "call-ended",
        handleCallEnded
      );
    };

  }, [socket]);

  // ================= CLEANUP =================

  const cleanupCall = () => {

  if (connectionRef.current) {
    connectionRef.current.destroy();
    connectionRef.current = null;
  }

  if (stream) {
    stream
      .getTracks()
      .forEach(track => track.stop());
  }

  if (myVideo.current) {
    myVideo.current.srcObject = null;
  }

  if (userVideo.current) {
    userVideo.current.srcObject = null;
  }

  onClose();
};
  // ================= CALL USER =================

  const callUser = () => {

    if (!stream) {

      alert(
        "Camera not ready"
      );

      return;
    }

    const peer = new Peer({
  initiator: true,
  trickle: false,
  stream,

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

peer.on("error", (err) => {
  console.log("Peer Error:", err);
});

peer.on("close", () => {
  console.log("Peer closed");
});

    peer.on(
      "signal",
      (signal) => {

        socket.emit(
          "call-user",
          {
            to:
              selectedUser._id,

            from: currentUser,

            signal,

            callType:
              "video",
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

    connectionRef.current =
      peer;
  };

  // ================= ANSWER CALL =================

  const answerCall = () => {

    if (!stream) {

      alert(
        "Camera not ready"
      );

      return;
    }

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
              caller?._id ||
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

    socket.emit(
      "end-call",
      {
        to:
          selectedUser._id,
      }
    );

    cleanupCall();
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
        .forEach((track) => {

          track.enabled =
            !track.enabled;
        });

      setCameraOn(
        !cameraOn
      );
    };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">

      {/* VIDEOS */}
      <div className="flex-1 relative">

        {/* REMOTE VIDEO */}
        <video
          ref={userVideo}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* MY VIDEO */}
        <video
          ref={myVideo}
          autoPlay
          muted
          playsInline
          className="absolute bottom-5 right-5 w-32 h-44 md:w-52 md:h-64 rounded-2xl object-cover border-4 border-white shadow-2xl"
        />

        {/* USER INFO */}
        <div className="absolute top-5 left-5 text-white">

          <h2 className="text-2xl font-bold">
            {
              selectedUser?.name
            }
          </h2>

          <p className="text-gray-300">

            {callAccepted
              ? "Video call connected"
              : receivingCall
              ? "Incoming video call..."
              : "Calling..."}

          </p>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="bg-black/80 py-6 flex justify-center gap-5">

        {!callAccepted &&
          !receivingCall && (

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
              Answer
            </button>
          )}

        {/* MIC */}
        <button
          onClick={
            toggleMic
          }
          className={`w-16 h-16 rounded-full text-2xl flex items-center justify-center ${
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
          className={`w-16 h-16 rounded-full text-2xl flex items-center justify-center ${
            cameraOn
              ? "bg-gray-700"
              : "bg-red-500"
          }`}
        >
          {cameraOn
            ? "📹"
            : "🚫"}
        </button>

        {/* END */}
        <button
          onClick={
            endCall
          }
          className="w-16 h-16 rounded-full bg-red-600 text-2xl flex items-center justify-center"
        >
          📞
        </button>

      </div>
    </div>
  );
};

export default VideoCall;