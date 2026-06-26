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


  // ================= CLEANUP =================


  const cleanupCall = () => {

  connectionRef.current?.destroy();
  connectionRef.current = null;

  ringtoneRef.current?.pause();
  callingRef.current?.pause();

  if (ringtoneRef.current)
    ringtoneRef.current.currentTime = 0;

  if (callingRef.current)
    callingRef.current.currentTime = 0;

  stream?.getTracks().forEach(track => {
    track.stop();
  });

  if (myVideo.current) {
    myVideo.current.srcObject = null;
  }

  if (userVideo.current) {
    userVideo.current.srcObject = null;
  }

  setCallAccepted(false);
  setReceivingCall(false);

  onClose();
};


  // ================= START CALL =================


  const callUser = () => {

  if (!stream) return;

  if (callingRef.current) {
    callingRef.current.play().catch(err =>
      console.log(
        "Calling sound blocked:",
        err
      )
    );
  }

  const peer = createPeer(true);

  peer.on("signal", signal => {

    socket.emit("call-user", {

      to: selectedUser._id,

      from: currentUser,

      signal,

      callType: "video",

    });

  });

  peer.on("stream", remoteStream => {

    if (userVideo.current) {
      userVideo.current.srcObject =
        remoteStream;
    }

  });

  connectionRef.current = peer;

};




  // ================= ANSWER =================


  const answerCall = () => {

  if (!stream) return;

  ringtoneRef.current?.pause();
  ringtoneRef.current.currentTime = 0;

  setCallAccepted(true);

  const peer = createPeer(false);

  peer.on("signal", signal => {

    socket.emit("answer-call", {

      signal,

      to: caller,

    });

  });

  peer.on("stream", remoteStream => {

    if (userVideo.current) {

      userVideo.current.srcObject =
        remoteStream;

    }

  });

  peer.signal(callerSignal);

  connectionRef.current = peer;

};


  // ================= END CALL =================


  const endCall = () => {

  socket.emit("end-call", {

    to: selectedUser._id,

  });

  cleanupCall();

};



// ================= TOGGLE MIC=================
  const toggleMic = () => {

  const enabled = !micOn;

  stream?.getAudioTracks().forEach(track => {

    track.enabled = enabled;

  });

  setMicOn(enabled);

};




// ================= TOGGLE CAMERA =================
  const toggleCamera = () => {

  const enabled = !cameraOn;

  stream?.getVideoTracks().forEach(track => {

    track.enabled = enabled;

  });

  setCameraOn(enabled);

};


// ================= AUTO START CALL =================

useEffect(() => {

  if (
    stream &&
    selectedUser &&
    !receivingCall &&
    !callAccepted &&
    !connectionRef.current
  ) {
    callUser();
  }

}, [
  stream,
  selectedUser,
  receivingCall,
  callAccepted,
]);




  return (

<div className="fixed inset-0 bg-black z-50 flex flex-col">


<div className="flex-1 relative">


<video
ref={userVideo}
autoPlay
playsInline
className="w-full h-full object-cover"
/>



<video
ref={myVideo}
autoPlay
muted
playsInline
className="absolute bottom-5 right-5 w-32 h-44 rounded-xl border"
/>



<div className="absolute top-5 left-5 text-white">

<h2 className="text-2xl font-bold">
{selectedUser?.name}
</h2>


<p>

{
callAccepted
?
"Connected"
:
receivingCall
?
"Incoming call"
:
"Calling..."
}

</p>


</div>


</div>





<div className="bg-black/80 p-5 flex justify-center gap-5">


{
receivingCall &&
!callAccepted &&

<button
onClick={answerCall}
className="bg-green-600 px-5 py-3 rounded-xl"
>
Answer
</button>
}




{
!receivingCall &&
!callAccepted &&

<button
onClick={callUser}
className="bg-blue-600 px-5 py-3 rounded-xl"
>
Call
</button>
}





<button
onClick={toggleMic}
className="w-16 h-16 rounded-full bg-gray-700"
>

{
micOn?"🎤":"🔇"
}

</button>




<button
onClick={toggleCamera}
className="w-16 h-16 rounded-full bg-gray-700"
>

{
cameraOn?"📹":"🚫"
}

</button>




<button
onClick={endCall}
className="w-16 h-16 rounded-full bg-red-600"
>

📞

</button>



</div>


</div>

  );

};


export default VideoCall;