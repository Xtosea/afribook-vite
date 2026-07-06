import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import useMedia from "./useMedia";
import usePeerConnection from "./usePeerConnection";

const CALL_TIMEOUT = 30000;

const useWebRTC = ({
  currentUser,
  selectedUser,
  socket,
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

  } = useMedia();

  // ===============================
  // PEER
  // ===============================

  const {

    peerRef,

    remoteStream,

    connectionState,

    iceConnectionState,

    createPeer,

    createOffer,

    createAnswer,

    setRemoteDescription,

    addIceCandidate,

    destroyPeer,

  } = usePeerConnection();

  // ===============================
  // CALL STATE
  // ===============================

  const [calling, setCalling] =
    useState(false);

  const [receivingCall, setReceivingCall] =
    useState(false);

  const [callAccepted, setCallAccepted] =
    useState(false);

  const [incomingVideo, setIncomingVideo] =
    useState(false);

  const [caller, setCaller] =
    useState(null);

  const [callerSignal, setCallerSignal] =
    useState(null);

  const [callStartedAt, setCallStartedAt] =
    useState(null);

  // ===============================
  // REFS
  // ===============================

  const timeoutRef =
    useRef(null);

  const mountedRef =
    useRef(true);

  const callTypeRef =
    useRef("voice");

  const initializedRef =
  useRef(false);

 // ======================================
// INITIALIZE MEDIA
// ======================================

useEffect(() => {

  if (initializedRef.current) {
    return;
  }

  initializedRef.current = true;

  startMedia();

  return () => {

    stopMedia();

    destroyPeer();

  };

}, [
  startMedia,
  stopMedia,
  destroyPeer,
]);

  // ===============================
  // MOUNT
  // ===============================

  useEffect(() => {

    mountedRef.current = true;

    return () => {

      mountedRef.current = false;

    };

  }, []);


// ===============================
  // SOCKET EVENTS
  // ===============================

  useEffect(() => {

    if (!socket) return;

    // -----------------------------
    // Incoming Call
    // -----------------------------

    const handleIncomingCall = ({
      from,
      signal,
      callType,
    }) => {

      console.log(
        "📥 Incoming Call"
      );

      setCaller(from);

      setCallerSignal(signal);

      setIncomingVideo(
        callType === "video"
      );

      setReceivingCall(true);

    };

    // -----------------------------
    // Call Accepted
    // -----------------------------

    const handleCallAccepted =
      async (answer) => {

        try {

          await setRemoteDescription(
            answer
          );

          clearTimeout(
            timeoutRef.current
          );

          timeoutRef.current = null;

          setCalling(false);

          setCallAccepted(true);

          setCallStartedAt(
            Date.now()
          );

        } catch (err) {

          console.error(err);

        }

      };

    // -----------------------------
    // ICE
    // -----------------------------

    const handleIceCandidate =
      async ({
        candidate,
      }) => {

        try {

          await addIceCandidate(
            candidate
          );

        } catch (err) {

          console.error(err);

        }

      };

    // -----------------------------
    // End Call
    // -----------------------------

    const handleCallEnded =
      () => {

        console.log(
          "📴 Call Ended"
        );

        stopMedia();

        destroyPeer();

        setCalling(false);

        setReceivingCall(false);

        setCallAccepted(false);

        setCaller(null);

        setCallerSignal(null);

        setIncomingVideo(false);

        setCallStartedAt(null);

      };

    // -----------------------------
    // Register
    // -----------------------------

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

    socket.on(
      "call-rejected",
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

      socket.off(
        "call-rejected",
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


// ======================================
// END CALL
// ======================================

const endCall = useCallback(() => {

  console.log("📴 Ending Call");

  // -----------------------------
  // Stop timeout
  // -----------------------------

  if (timeoutRef.current) {

    clearTimeout(
      timeoutRef.current
    );

    timeoutRef.current = null;

  }

  // -----------------------------
  // Notify remote user
  // -----------------------------

  const targetUser =
  selectedUser?._id || caller;

if (socket && targetUser) {

  socket.emit("end-call", {
    to: targetUser,
  });

}

  // -----------------------------
  // Stop local media
  // -----------------------------

  stopMedia();

  // -----------------------------
  // Destroy peer connection
  // -----------------------------

  destroyPeer();
  

  // -----------------------------
  // Reset call state
  // -----------------------------

  setCalling(false);

  setReceivingCall(false);

  setCallAccepted(false);

  setCaller(null);

  setCallerSignal(null);

  setIncomingVideo(false);

  setCallStartedAt(null);

}, [

  socket,

  selectedUser,
  caller,

  stopMedia,

  destroyPeer,

]);




// ======================================
// START CALL
// ======================================

const callUser = useCallback(async () => {

  if (
    !socket ||
    !selectedUser ||
    !currentUser
  ) {
    return;
  }

  if (calling) {
    return;
  }

  if (peerRef.current) {
    console.log(
      "Peer already exists."
    );
    return;
  }

  try {

    // ----------------------------------
    // Start Camera/Microphone
    // ----------------------------------

    const stream =
      await startMedia();

    if (!stream) {

      console.log(
        "No local stream."
      );

      return;

    }

    // ----------------------------------
    // Create Peer
    // ----------------------------------

    createPeer(stream);

    // ----------------------------------
    // ICE Candidates
    // ----------------------------------

    peerRef.current.onicecandidate =
      (event) => {

        if (!event.candidate) return;

        socket.emit(
          "ice-candidate",
          {
            to: selectedUser._id,
            candidate:
              event.candidate,
          }
        );

      };

    // ----------------------------------
    // SDP Offer
    // ----------------------------------

    const offer =
      await createOffer();

    socket.emit(
      "call-user",
      {
        to:
          selectedUser._id,

        from:
          currentUser,

        signal:
          offer,

  const startVoiceCall = () => {
  callTypeRef.current = "voice";
  callUser();
};

  const startVideoCall = () => {
  callTypeRef.current = "video";
  callUser();
};
      }
    );

    console.log(
      "📤 Calling",
      selectedUser.name
    );

    setCalling(true);

    timeoutRef.current =
      setTimeout(() => {

        console.log(
          "⌛ Call Timeout"
        );

        endCall();

      }, CALL_TIMEOUT);

  } catch (err) {

    console.error(
      "Call Error:",
      err
    );

    endCall();

  }

}, [

  socket,

  currentUser,

  selectedUser,

  

  calling,

  startMedia,

  createPeer,

  createOffer,

  endCall,

]);


// ======================================
// ANSWER CALL
// ======================================

const answerCall = useCallback(async () => {

  if (
    !socket ||
    !caller ||
    !callerSignal
  ) {
    return;
  }

  if (peerRef.current) {
    console.log(
      "Peer already exists."
    );
    return;
  }

  try {

    // ----------------------------------
    // Start Camera/Microphone
    // ----------------------------------

    const stream =
      await startMedia();

    if (!stream) {

      console.log(
        "No local stream."
      );

      return;

    }

    // ----------------------------------
    // Create Peer
    // ----------------------------------

    createPeer(stream);

    // ----------------------------------
    // ICE Candidates
    // ----------------------------------

    peerRef.current.onicecandidate =
      (event) => {

        if (!event.candidate) return;

        socket.emit(
          "ice-candidate",
          {
            to: caller,
            candidate:
              event.candidate,
          }
        );

      };

    // ----------------------------------
    // Receive Offer
    // ----------------------------------

    await setRemoteDescription(
      callerSignal
    );

    // ----------------------------------
    // Create Answer
    // ----------------------------------

    const answer =
      await createAnswer();

    socket.emit(
      "answer-call",
      {
        to: caller,
        signal: answer,
      }
    );

    clearTimeout(
      timeoutRef.current
    );

    setReceivingCall(false);

    setCallAccepted(true);

    setCallStartedAt(
      Date.now()
    );

    console.log(
      "✅ Call Answered"
    );

  } catch (err) {

    console.error(
      "Answer Error:",
      err
    );

    endCall();

  }

}, [

  socket,

  caller,

  callerSignal,

  startMedia,

  createPeer,

  createAnswer,

  setRemoteDescription,

  endCall,

]);



// ======================================
// CLEANUP
// ======================================

useEffect(() => {

  return () => {

    console.log(
      "🧹 Cleaning up WebRTC"
    );

    if (timeoutRef.current) {

      clearTimeout(
        timeoutRef.current
      );

    }

    stopMedia();

    destroyPeer();

  };

}, [

  stopMedia,

  destroyPeer,

]);



