import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import useMedia from "./useMedia";

import usePeerConnection from "./usePeerConnection";

const useWebRTC = ({
  currentUser,
  selectedUser,
  socket,
  video = false,
}) => {

  // ===============================
  // MEDIA
  // ===============================

  const {
  localStream,
  startMedia,
  stopMedia,
  toggleMic,
  toggleCamera,
  micEnabled,
  cameraEnabled,
} = useMedia({ video });

  // ===============================
  // PEER CONNECTION
  // ===============================

  const {

    peerRef,

    remoteStream,

    connectionState,

    iceConnectionState,

    createPeer,

    destroyPeer,

    resetPeer,

    createOffer,

    createAnswer,

    setRemoteDescription,

    addIceCandidate,

  } = usePeerConnection();

  // ===============================
  // CALL STATE
  // ===============================

  const [receivingCall, setReceivingCall] =
    useState(false);

  const [callAccepted, setCallAccepted] =
    useState(false);

  const [caller, setCaller] =
    useState(null);

  const [callerSignal, setCallerSignal] =
    useState(null);

  const [callStartedAt, setCallStartedAt] =
    useState(null);

  const [calling, setCalling] =
    useState(false);

const [incomingVideo,setIncomingVideo] =
useState(false);

  // ===============================
  // REFS
  // ===============================

  const timeoutRef =
    useRef(null);

  const mountedRef =
    useRef(true);

  // ===============================
  // INITIALIZE MEDIA USE EFFECTS 
  // ===============================

useEffect(() => {
  mountedRef.current = true;

  startMedia();

  return () => {
    mountedRef.current = false;

    stopMedia();
    destroyPeer();
  };
}, [
  startMedia,
  stopMedia,
  destroyPeer,
]);
  

// ===============================
  // SOCKET EVENTS
  // ===============================

  useEffect(() => {

    if (!socket) return;

    // -------------------------------
    // Incoming Call
    // -------------------------------

    const handleIncomingCall = ({
      from,
      signal,
      callType,
    }) => {

      console.log("📥 incoming-call event received");
console.log({
  from,
  signal,
  callType,
});

      setReceivingCall(true);

      setCaller(from);

      setCallerSignal(signal);

      setIncomingVideo(
      callType === "video"
    );

    };

    // -------------------------------
    // Call Accepted
    // -------------------------------

    const handleCallAccepted =
      async (answer) => {

console.log("✅ call-accepted received");
console.log(answer);

        try {

          await setRemoteDescription(
            answer
          );

         if (timeoutRef.current) {
  clearTimeout(timeoutRef.current);
  timeoutRef.current = null;
}

          setCallAccepted(true);

          setCalling(false);

          setCallStartedAt(
            Date.now()
          );

        } catch (err) {

          console.error(
            "Call Accepted Error:",
            err
          );

        }

      };

    // -------------------------------
    // ICE Candidate
    // -------------------------------

    const handleIceCandidate =
async ({ candidate }) => {

console.log("🧊 ICE candidate received");
console.log(candidate);

  try {

    await addIceCandidate(candidate);

  } catch (err) {

    console.error(
      "ICE Error:",
      err
    );

  }

};


    // -------------------------------
    // End Call
    // -------------------------------

    const handleCallEnded =
      () => {

        console.log(
          "📴 Call Ended"
        );

       if (peerRef.current) {

  peerRef.current.onicecandidate = null;

}

        stopMedia();

        destroyPeer();

        setReceivingCall(false);

        setCallAccepted(false);

        setCalling(false);

        setCaller(null);

        setCallerSignal(null);

        setCallStartedAt(
          null
        );
       
        setIncomingVideo(false);

      };

    socket.on(
      "incoming-call",
      handleIncomingCall
    );

    socket.on(
      "call-accepted",
      handleCallAccepted
    );

    socket.on(
      "ice-candidate",
      handleIceCandidate
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
        "ice-candidate",
        handleIceCandidate
      );

      socket.off(
        "call-ended",
        handleCallEnded
      );

    };

  }, [
    socket,
    addIceCandidate,
    destroyPeer,
    setRemoteDescription,
    stopMedia,
  ]);

  // ===============================
  // CONNECTION TIMEOUT
  // ===============================

  useEffect(() => {

    if (!calling)
      return;

    timeoutRef.current =
      setTimeout(() => {

        console.log(
          "⌛ Call Timed Out"
        );

        stopMedia();

        destroyPeer();

        setCalling(false);

      }, 30000);

    return () => {

      clearTimeout(
        timeoutRef.current
      );

    };

  }, [
    calling,
    stopMedia,
    destroyPeer,
  ]);



// ===============================
  // START CALL
  // ===============================

  const callUser =
  useCallback(async () => {

    if (
 !selectedUser ||
 !currentUser ||
 !localStream ||
 !socket
) {
      return;
    }

    // Prevent duplicate calls
    if (peerRef.current) {
      console.log(
        "Peer connection already exists."
      );
      return;
    }

    try {

      const peer =
        createPeer(localStream);

      peer.onicecandidate =
        (event) => {

          if (!event.candidate)
            return;

          socket.emit(
            "ice-candidate",
            {
              to:
                selectedUser._id,

              from:
                currentUser,

              candidate:
                event.candidate,
            }
          );

        };

      const offer =
        await createOffer();


console.log("📤 Emitting call-user", {
  to: selectedUser._id,
  from: currentUser,
  callType: video ? "video" : "voice",
});

      socket.emit(
        "call-user",
        {
          to:
            selectedUser._id,

          from:
            currentUser,

          signal:
            offer,

          callType:
            video
              ? "video"
              : "voice",
        }
      );

      setCalling(true);

    } catch (err) {

      console.error(
        "Call Error:",
        err
      );

    }

  }, [
    peerRef,
    localStream,
    currentUser,
    selectedUser,
    socket,
    video,
    createPeer,
    createOffer,
  ]);

  // ===============================
  // ANSWER CALL
  // ===============================

  const answerCall = useCallback(async () => {

  if (peerRef.current) {
    console.log("Peer already exists.");
    return;
  }

  if (!callerSignal || !localStream) {
    return;
  }

  try {

    const peer = createPeer(localStream);

    peer.onicecandidate = (event) => {

      if (!event.candidate) return;

      socket.emit("ice-candidate", {
        to: caller,
        from: currentUser,
        candidate: event.candidate,
      });

    };

    await setRemoteDescription(callerSignal);

    const answer = await createAnswer();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

console.log("📤 Sending answer-call");

    socket.emit("answer-call", {
      to: caller,
      signal: answer,
    });

    setReceivingCall(false);
    setCallAccepted(true);
    setCallStartedAt(Date.now());

  } catch (err) {

    console.error(err);

  }

}, [
  peerRef,
  caller,
  callerSignal,
  currentUser,
  socket,
  localStream,
  createPeer,
  createAnswer,
  setRemoteDescription,
]);

  // ===============================
  // END CALL
  // ===============================

  const endCall =
    useCallback(() => {

      if (
        selectedUser
      ) {


console.log("📴 Sending end-call");

        socket.emit(
          "end-call",
          {
            to:
              selectedUser._id,
          }
        );

      }

      stopMedia();

      destroyPeer();

      setCalling(false);

      setReceivingCall(false);

      setCallAccepted(false);

      setCaller(null);

      setCallerSignal(null);

      setCallStartedAt(null);
      
      setIncomingVideo(false);

    }, [
socket,
  
selectedUser,

stopMedia,

destroyPeer,

]);


// ===============================
  // RETURN
  // ===============================

  return {
  localStream,
  remoteStream,

  calling,
  receivingCall,
  callAccepted,
  callStartedAt,
  caller,
  incomingVideo,

  connectionState,
  iceConnectionState,

  microphoneEnabled: micEnabled,
  cameraEnabled,

  callUser,
  answerCall,
  endCall,

  toggleMicrophone: toggleMic,
  toggleCamera,
};

};

export default useWebRTC;