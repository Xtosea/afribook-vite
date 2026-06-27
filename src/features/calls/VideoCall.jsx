import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import useWebRTC from "./useWebRTC";
import useCallSounds from "./CallSounds";
import CallTimer from "./CallTimer";
import CallControls from "./CallControls";


const VideoCall = ({
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

  } = useWebRTC({

    currentUser,

    selectedUser,

    socket,

    video: true,

  });



  // ===============================
  // SOUNDS
  // ===============================

  const {

    playCalling,

    stopCalling,

    playRingtone,

    stopRingtone,

    stopAllSounds,

  } = useCallSounds();




  // ===============================
  // REFS
  // ===============================


  const localVideoRef =
    useRef(null);


  const remoteVideoRef =
    useRef(null);



  // ===============================
  // SPEAKER
  // ===============================

  const [
    speakerEnabled,
    setSpeakerEnabled
  ] = useState(true);



  // ===============================
  // LOCAL VIDEO
  // ===============================


  useEffect(() => {

    if(
      localVideoRef.current &&
      localStream
    ){

      localVideoRef.current.srcObject =
        localStream;

    }


  },[localStream]);




  // ===============================
  // REMOTE VIDEO
  // ===============================


  useEffect(() => {


    if(

      remoteVideoRef.current &&
      remoteStream

    ){

      remoteVideoRef.current.srcObject =
        remoteStream;

    }


  },[remoteStream]);




  // ===============================
  // SPEAKER CONTROL
  // ===============================


  useEffect(()=>{


    if(remoteVideoRef.current){

      remoteVideoRef.current.muted =
        !speakerEnabled;

    }


  },[speakerEnabled]);




  // ===============================
  // RINGTONE
  // ===============================


  useEffect(()=>{


    if(
      receivingCall &&
      !callAccepted
    ){

      playRingtone();

    }
    else{

      stopRingtone();

    }


  },[
    receivingCall,
    callAccepted,
    playRingtone,
    stopRingtone
  ]);




  // ===============================
  // CALLING SOUND
  // ===============================


  useEffect(()=>{


    if(
      calling &&
      !callAccepted
    ){

      playCalling();

    }
    else{

      stopCalling();

    }


  },[
    calling,
    callAccepted,
    playCalling,
    stopCalling
  ]);




  // ===============================
  // AUTO CALL
  // ===============================


  useEffect(()=>{


    if(

      selectedUser &&
      !receivingCall &&
      !calling &&
      !callAccepted

    ){

      callUser();

    }


  },[
    selectedUser,
    receivingCall,
    calling,
    callAccepted,
    callUser
  ]);




  // ===============================
  // CLEANUP
  // ===============================


  useEffect(()=>{


    return()=>{

      stopAllSounds();

    };


  },[
    stopAllSounds
  ]);




  // ===============================
  // END CALL
  // ===============================


  const handleEndCall =()=>{


    stopAllSounds();

    endCall();

    onClose();


  };


// ===============================
  // USER DISPLAY
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


  if(
    receivingCall &&
    !callAccepted
  ){

    callStatus = "Incoming video call";

  }


  if(callAccepted){

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
      bg-black
      z-50
      flex
      flex-col
      "
    >


      {/* REMOTE VIDEO */}

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
              w-24
              h-24
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



        {/* LOCAL VIDEO */}


        <div
          className="
          absolute
          right-4
          top-4
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

{/* ===============================
          CALL INFO + TIMER
      =============================== */}


      <div
        className="
        bg-gray-900
        p-4
        text-center
        "
      >


        {
          callAccepted && (

            <CallTimer
  callStartedAt={callStartedAt}
/>

          )
        }



        {
          receivingCall &&
          !callAccepted && (

            <p
              className="
              text-white
              mb-3
              "
            >

              Incoming video call

            </p>

          )
        }


      </div>





      {/* ===============================
          CONTROLS
      =============================== */}


      <div
        className="
        bg-gray-900
        p-5
        "
      >


 <CallControls
  video={true}
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
    setSpeakerEnabled(prev => !prev)
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

  );


};


export default VideoCall;