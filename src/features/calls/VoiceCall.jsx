import {
  useEffect,
  useRef,
  useState,
} from "react";

import useWebRTC from "./useWebRTC";
import useCallSounds from "./CallSounds";
import CallTimer from "./CallTimer";
import CallControls from "./CallControls";

const VoiceCall = ({
  currentUser,
  selectedUser,
  socket,
  onClose,
  defaultProfile,
}) => {

  // ===============================
  // WEBRTC
  // ===============================

  const {

    remoteStream,

    calling,

    receivingCall,

    callAccepted,

    callStartedAt,

    microphoneEnabled,

    callUser,

    answerCall,

    endCall,

    toggleMicrophone,

  } = useWebRTC({

    currentUser,

    selectedUser,

    socket,

    video: false,

  });

  // ===============================
  // CALL SOUNDS
  // ===============================

  const {

    playCalling,

    stopCalling,

    playRingtone,

    stopRingtone,

    stopAllSounds,

  } = useCallSounds();

  // ===============================
  // LOCAL STATE
  // ===============================

  const [speakerEnabled, setSpeakerEnabled] =
    useState(true);

  const remoteAudioRef =
    useRef(null);

const startedCallRef = useRef(false);

  // ===============================
  // REMOTE AUDIO
  // ===============================

  useEffect(() => {

    if (
      remoteAudioRef.current &&
      remoteStream
    ) {

      remoteAudioRef.current.srcObject =
        remoteStream;

    }

  }, [remoteStream]);

  // ===============================
  // SPEAKER
  // ===============================

  useEffect(() => {

    if (
      remoteAudioRef.current
    ) {

      remoteAudioRef.current.muted =
        !speakerEnabled;

    }

  }, [speakerEnabled]);

  // ===============================
  // CALL SOUNDS
  // ===============================

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

    playRingtone,

    stopRingtone,

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

    playCalling,

    stopCalling,

  ]);

  // ===============================
  // AUTO START CALL
  // ===============================

  useEffect(() => {

  if (

    selectedUser &&

    !receivingCall &&

    !calling &&

    !callAccepted

  ) {

    callUser();

  }

}, [
  selectedUser,
  receivingCall,
  calling,
  callAccepted,
  callUser,
]);

  // ===============================
  // CLEANUP
  // ===============================

  useEffect(() => {

    return () => {

      stopAllSounds();

    };

  }, [stopAllSounds]);

  // ===============================
  // END CALL
  // ===============================

  const handleEndCall = () => {

    stopAllSounds();

    endCall();

    onClose();

  };


// ===============================
  // FORMAT USER
  // ===============================

  const displayName =
    selectedUser?.name ||
    selectedUser?.username ||
    "User";


  const profileImage =
  selectedUser?.profilePic ||
  defaultProfile ||
  "/default-avatar.png";


  // ===============================
  // CALL STATUS
  // ===============================

  let callStatus = "Calling...";


  if (receivingCall && !callAccepted) {

    callStatus = "Incoming call";

  }


  if (callAccepted) {

    callStatus = "Connected";

  }



  // ===============================
  // UI
  // ===============================


  return (

    <div
      className="
      fixed
      inset-0
      bg-black/80
      flex
      items-center
      justify-center
      z-50
      "
    >


      <div
        className="
        bg-gray-900
        rounded-2xl
        w-[90%]
        max-w-md
        p-6
        text-white
        shadow-xl
        "
      >


        {/* Hidden remote audio */}

        <audio

          ref={remoteAudioRef}

          autoPlay

          playsInline

        />



        {/* PROFILE */}

        <div
          className="
          flex
          flex-col
          items-center
          "
        >


          <img

            src={profileImage}

            alt="profile"

            className="
            w-28
            h-28
            rounded-full
            object-cover
            border-4
            border-gray-700
            "

          />


          <h2
            className="
            text-xl
            font-bold
            mt-4
            "
          >

            {displayName}

          </h2>



          <p
            className="
            text-gray-400
            mt-1
            "
          >

            {callStatus}

          </p>


        </div>




        {/* TIMER */}

        {
          callAccepted && (

            <div
              className="
              flex
              justify-center
              mt-5
              "
            >

              <CallTimer

                startedAt={
                  callStartedAt
                }

              />


            </div>

          )
        }




        {/* CONTROLS */}

        <div
          className="
          mt-8
          "
        >


          <CallControls

            microphoneEnabled={
              microphoneEnabled
            }


            speakerEnabled={
              speakerEnabled
            }


            onToggleMic={
              toggleMicrophone
            }


            onToggleSpeaker={() =>
              setSpeakerEnabled(
                prev => !prev
              )
            }


            onAnswer={
              answerCall
            }


            onEnd={
              handleEndCall
            }


            incoming={
              receivingCall &&
              !callAccepted
            }


          />


        </div>



      </div>


    </div>

  );

};


export default VoiceCall;