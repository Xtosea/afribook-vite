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
}) => {
  const socket = connectSocket();

  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] =
    useState(false);

  const [callerSignal, setCallerSignal] =
    useState(null);

  const [callAccepted, setCallAccepted] =
    useState(false);

  const myVideo = useRef();
  const userVideo = useRef();

  const connectionRef = useRef();

  // GET CAMERA
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        setStream(stream);

        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      });

    socket.on("incoming-call", (data) => {
      setReceivingCall(true);
      setCallerSignal(data.signal);
    });
  }, []);

  // CALL USER
  const callUser = () => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("call-user", {
        to: selectedUser._id,
        from: currentUser,
        signal,
      });
    });

    peer.on("stream", (remoteStream) => {
      userVideo.current.srcObject =
        remoteStream;
    });

    socket.on("call-accepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  // ANSWER CALL
  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("answer-call", {
        signal,
        to: selectedUser._id,
      });
    });

    peer.on("stream", (remoteStream) => {
      userVideo.current.srcObject =
        remoteStream;
    });

    peer.signal(callerSignal);

    connectionRef.current = peer;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* TOP */}
      <div className="flex justify-between p-4 text-white">
        <h2 className="text-xl font-bold">
          Video Call
        </h2>

        <button
          onClick={() => window.location.reload()}
          className="bg-red-500 px-4 py-2 rounded-full"
        >
          End
        </button>
      </div>

      {/* VIDEOS */}
      <div className="flex-1 grid md:grid-cols-2 gap-4 p-4">
        <video
          playsInline
          muted
          ref={myVideo}
          autoPlay
          className="w-full h-full object-cover rounded-2xl bg-gray-900"
        />

        <video
          playsInline
          ref={userVideo}
          autoPlay
          className="w-full h-full object-cover rounded-2xl bg-gray-900"
        />
      </div>

      {/* CONTROLS */}
      <div className="p-6 flex justify-center gap-4">
        {!callAccepted && (
          <button
            onClick={callUser}
            className="bg-green-500 px-6 py-3 rounded-full text-white font-bold"
          >
            Start Call
          </button>
        )}

        {receivingCall && !callAccepted && (
          <button
            onClick={answerCall}
            className="bg-blue-500 px-6 py-3 rounded-full text-white font-bold"
          >
            Answer Call
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCall;