import {
  useEffect,
  useRef,
  useState,
} from "react";

import useCallSounds from "./CallSounds";
import CallTimer from "./CallTimer";
import CallControls from "./CallControls";

const CallScreen = ({

  video,

  isOutgoing,

  selectedUser,

  defaultProfile,

  onClose,

  localStream,

  remoteStream,

  calling,

  receivingCall,

  callAccepted,

  callStartedAt,

  microphoneEnabled,

  cameraEnabled,

  callUser,

  answerCall,

  endCall,

  toggleMicrophone,

  toggleCamera,

}) => {

  // ==========================
  // SOUNDS
  // ==========================

  const {

    playCalling,

    stopCalling,

    playRingtone,

    stopRingtone,

    stopAllSounds,

  } = useCallSounds();

  // ==========================
  // REFS
  // ==========================

  const localVideoRef =
    useRef(null);

  const remoteVideoRef =
    useRef(null);

  const remoteAudioRef =
    useRef(null);

  const startedCallRef =
    useRef(false);

  // ==========================
  // STATE
  // ==========================

  const [
    speakerEnabled,
    setSpeakerEnabled,
  ] = useState(true);

useEffect(() => {

  if (
    video &&
    localVideoRef.current &&
    localStream
  ) {

    localVideoRef.current.srcObject =
      localStream;

  }

}, [

  video,

  localStream,

]);


useEffect(() => {

  if (!remoteStream)
    return;

  if (
    video &&
    remoteVideoRef.current
  ) {

    remoteVideoRef.current.srcObject =
      remoteStream;

  }

  if (
    !video &&
    remoteAudioRef.current
  ) {

    remoteAudioRef.current.srcObject =
      remoteStream;

  }

}, [

  video,

  remoteStream,

]);



useEffect(() => {

  if (
    video &&
    remoteVideoRef.current
  ) {

    remoteVideoRef.current.muted =
      !speakerEnabled;

  }

  if (
    !video &&
    remoteAudioRef.current
  ) {

    remoteAudioRef.current.muted =
      !speakerEnabled;

  }

}, [

  video,

  speakerEnabled,

]);



useEffect(() => {

  if (
    receivingCall &&
    !callAccepted
  ) {

    playRingtone();

  } else {

    stopRingtone();

  }

}, [

  receivingCall,

  callAccepted,

]);


useEffect(() => {

  if (
    calling &&
    !callAccepted
  ) {

    playCalling();

  } else {

    stopCalling();

  }

}, [

  calling,

  callAccepted,

]);


useEffect(() => {

  if (!isOutgoing)
    return;

  if (startedCallRef.current)
    return;

  if (!selectedUser)
    return;

  startedCallRef.current = true;

  callUser();

}, [

  isOutgoing,

  selectedUser,

  callUser,

]);


useEffect(() => {

  return () => {

    stopAllSounds();

  };

}, []);


// ======================================
// USER INFO
// ======================================

const displayName =
  selectedUser?.name ||
  selectedUser?.username ||
  "User";

const profileImage =
  selectedUser?.profilePic ||
  defaultProfile ||
  "/default-avatar.png";

let callStatus = "Calling...";

if (
  receivingCall &&
  !callAccepted
) {

  callStatus =
    video
      ? "Incoming video call"
      : "Incoming voice call";

}

if (callAccepted) {

  callStatus = "Connected";

}

// ======================================
// END CALL
// ======================================

const handleEndCall = () => {

  stopAllSounds();

  endCall();

  onClose();

};

// ======================================
// UI
// ======================================

return (

<div
  className="
  fixed
  inset-0
  bg-black
  z-50
  flex
  flex-col
  "
>

  {/* ==========================
      VIDEO MODE
  ========================== */}

  {video ? (

    <>

      <div
        className="
        flex-1
        relative
        bg-gray-900
        "
      >

        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="
          w-full
          h-full
          object-cover
          "
        />

        {!remoteStream && (

          <div
            className="
            absolute
            inset-0
            flex
            flex-col
            items-center
            justify-center
            "
          >

            <img
              src={profileImage}
              className="
              w-28
              h-28
              rounded-full
              object-cover
              "
            />

            <h2
              className="
              text-white
              text-xl
              mt-4
              "
            >
              {displayName}
            </h2>

            <p
              className="
              text-gray-300
              "
            >
              {callStatus}
            </p>

          </div>

        )}

        {/* Local Preview */}

        <div
          className="
          absolute
          top-4
          right-4
          w-32
          h-44
          rounded-xl
          overflow-hidden
          border
          border-white
          bg-black
          "
        >

          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="
            w-full
            h-full
            object-cover
            "
          />

        </div>

      </div>

    </>

  ) : (

    /* ==========================
       VOICE MODE
    ========================== */

    <div
      className="
      flex-1
      flex
      flex-col
      items-center
      justify-center
      "
    >

      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
      />

      <img
        src={profileImage}
        className="
        w-36
        h-36
        rounded-full
        object-cover
        border-4
        border-gray-700
        "
      />

      <h2
        className="
        text-white
        text-2xl
        mt-6
        "
      >
        {displayName}
      </h2>

      <p
        className="
        text-gray-300
        mt-2
        "
      >
        {callStatus}
      </p>

    </div>

  )}

  {/* ==========================
      TIMER
  ========================== */}

  <div
    className="
    bg-gray-900
    p-4
    text-center
    "
  >

    {callAccepted && (

      <CallTimer
        callStartedAt={
          callStartedAt
        }
      />

    )}

  </div>

  {/* ==========================
      CONTROLS
  ========================== */}

  <div
    className="
    bg-gray-900
    p-5
    "
  >

    <CallControls

      video={video}

      microphoneEnabled={
        microphoneEnabled
      }

      cameraEnabled={
        cameraEnabled
      }

      speakerEnabled={
        speakerEnabled
      }

      onToggleMicrophone={
        toggleMicrophone
      }

      onToggleCamera={
        toggleCamera
      }

      onToggleSpeaker={() =>
        setSpeakerEnabled(
          prev => !prev
        )
      }

      onAnswer={
        answerCall
      }

      onEndCall={
        handleEndCall
      }

      incoming={
        receivingCall &&
        !callAccepted
      }

    />

  </div>

</div>

);

};

export default CallScreen;